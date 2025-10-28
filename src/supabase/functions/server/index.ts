import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store.ts";

const app = new Hono();

// Initialize Supabase clients
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Health check endpoint
app.get("/make-server-9367668c/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup
app.post("/make-server-9367668c/signup", async (c) => {
  try {
    const { email, password, name, country, currency } = await c.req.json();

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, country, currency },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (authError) {
      console.error("Signup auth error:", authError);
      
      // Provide more helpful error messages
      if (authError.message.includes("already been registered")) {
        return c.json({ error: "A user with this email address has already been registered. Please sign in instead." }, 400);
      }
      
      return c.json({ error: authError.message }, 400);
    }

    // Store user data in KV store
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      country,
      currency,
      createdAt: new Date().toISOString(),
    });

    return c.json({ user: authData.user });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Get user data
app.get("/make-server-9367668c/user", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.error("Get user error:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    return c.json({ user: userData || user });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// Update user profile
app.put("/make-server-9367668c/user", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, country, currency, photoUrl } = await c.req.json();

    // Get existing user data
    const existingUserData = await kv.get(`user:${user.id}`) || {};

    // Update user data
    const updatedUserData = {
      ...existingUserData,
      id: user.id,
      email: user.email,
      name,
      country,
      currency,
      photoUrl,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, updatedUserData);

    // Update auth metadata
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { name, country, currency, photoUrl },
    });

    return c.json({ user: updatedUserData });
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Create a new group
app.post("/make-server-9367668c/groups", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, members } = await c.req.json();
    const groupId = crypto.randomUUID();
    
    const group = {
      id: groupId,
      name,
      ownerId: user.id,
      members: [
        { id: user.id, name: user.user_metadata.name || "You" },
        ...members,
      ],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await kv.set(`group:${groupId}`, group);
    
    // Add to user's groups list
    const userGroupsKey = `user:${user.id}:groups`;
    const existingGroups = (await kv.get(userGroupsKey)) || [];
    await kv.set(userGroupsKey, [...existingGroups, groupId]);

    return c.json({ group });
  } catch (error) {
    console.error("Create group error:", error);
    return c.json({ error: "Failed to create group" }, 500);
  }
});

// Get all groups for a user
app.get("/make-server-9367668c/groups", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userGroupsKey = `user:${user.id}:groups`;
    const groupIds = (await kv.get(userGroupsKey)) || [];
    
    const groups = await Promise.all(
      groupIds.map(async (id: string) => {
        const group = await kv.get(`group:${id}`);
        if (!group) return null;
        
        // Get expenses for the group
        const expenses = await kv.get(`group:${id}:expenses`) || [];
        
        return {
          ...group,
          expenses,
          memberCount: group.members.length,
        };
      })
    );

    return c.json({ groups: groups.filter(Boolean) });
  } catch (error) {
    console.error("Get groups error:", error);
    return c.json({ error: "Failed to get groups" }, 500);
  }
});

// Get a specific group
app.get("/make-server-9367668c/groups/:id", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("id");
    const group = await kv.get(`group:${groupId}`);
    
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    const expenses = await kv.get(`group:${groupId}:expenses`) || [];
    
    return c.json({ group: { ...group, expenses } });
  } catch (error) {
    console.error("Get group error:", error);
    return c.json({ error: "Failed to get group" }, 500);
  }
});

// Add expense to a group
app.post("/make-server-9367668c/groups/:id/expenses", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("id");
    const { description, amount, payer, participants } = await c.req.json();

    // Get the group to find payer's ID
    const group = await kv.get(`group:${groupId}`);
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    // Find payer's ID
    const payerMember = group.members.find((m: any) => m.name === payer);
    const payerId = payerMember?.id;

    // Initialize paidBy array - if payer is a participant, they've already paid their share
    const paidBy: string[] = [];
    if (payerId && participants.includes(payerId)) {
      paidBy.push(payerId);
    }

    const expense = {
      id: crypto.randomUUID(),
      description,
      amount,
      payer,
      participants,
      paidBy,
      date: new Date().toISOString(),
      createdBy: user.id,
    };

    const expenses = await kv.get(`group:${groupId}:expenses`) || [];
    await kv.set(`group:${groupId}:expenses`, [expense, ...expenses]);

    // Update group's lastUpdated
    await kv.set(`group:${groupId}`, {
      ...group,
      lastUpdated: new Date().toISOString(),
    });

    return c.json({ expense });
  } catch (error) {
    console.error("Add expense error:", error);
    return c.json({ error: "Failed to add expense" }, 500);
  }
});

// Delete an expense
app.delete("/make-server-9367668c/groups/:groupId/expenses/:expenseId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("groupId");
    const expenseId = c.req.param("expenseId");

    const expenses = await kv.get(`group:${groupId}:expenses`) || [];
    const updatedExpenses = expenses.filter((e: any) => e.id !== expenseId);
    
    await kv.set(`group:${groupId}:expenses`, updatedExpenses);

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete expense error:", error);
    return c.json({ error: "Failed to delete expense" }, 500);
  }
});

// Mark expense as paid by user
app.post("/make-server-9367668c/groups/:groupId/expenses/:expenseId/mark-paid", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("groupId");
    const expenseId = c.req.param("expenseId");
    const { paid } = await c.req.json();

    const expenses = await kv.get(`group:${groupId}:expenses`) || [];
    const expenseIndex = expenses.findIndex((e: any) => e.id === expenseId);
    
    if (expenseIndex === -1) {
      return c.json({ error: "Expense not found" }, 404);
    }

    const expense = expenses[expenseIndex];
    
    // Initialize paidBy array if it doesn't exist
    if (!expense.paidBy) {
      expense.paidBy = [];
    }

    if (paid) {
      // Add user to paidBy array if not already there
      if (!expense.paidBy.includes(user.id)) {
        expense.paidBy.push(user.id);
      }
    } else {
      // Remove user from paidBy array
      expense.paidBy = expense.paidBy.filter((id: string) => id !== user.id);
    }

    expenses[expenseIndex] = expense;
    await kv.set(`group:${groupId}:expenses`, expenses);

    return c.json({ success: true, expense });
  } catch (error) {
    console.error("Mark expense as paid error:", error);
    return c.json({ error: "Failed to mark expense as paid" }, 500);
  }
});

// Upload profile photo
app.post("/make-server-9367668c/upload-photo", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Ensure bucket exists
    const bucketName = "make-9367668c-profile-photos";
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
    }

    // Get the file from the request
    const formData = await c.req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return c.json({ error: "Failed to upload photo" }, 500);
    }

    // Get signed URL (valid for 10 years)
    const { data: urlData } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(filePath, 315360000); // 10 years in seconds

    if (!urlData) {
      return c.json({ error: "Failed to generate photo URL" }, 500);
    }

    return c.json({ photoUrl: urlData.signedUrl });
  } catch (error) {
    console.error("Upload photo error:", error);
    return c.json({ error: "Failed to upload photo" }, 500);
  }
});

// Add member to a group by email
app.post("/make-server-9367668c/groups/:id/members", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("id");
    const { email } = await c.req.json();

    // Find user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError);
      return c.json({ error: "Failed to find user" }, 500);
    }

    const targetUser = users.users.find((u) => u.email === email);
    if (!targetUser) {
      return c.json({ error: "No user found with this email" }, 404);
    }

    // Get the group
    const group = await kv.get(`group:${groupId}`);
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    // Check if user is already a member
    const isMember = group.members.some((m: any) => m.id === targetUser.id);
    if (isMember) {
      return c.json({ error: "User is already a member of this group" }, 400);
    }

    // Add member to group
    const newMember = {
      id: targetUser.id,
      name: targetUser.user_metadata.name || targetUser.email,
    };
    group.members.push(newMember);
    group.lastUpdated = new Date().toISOString();
    
    await kv.set(`group:${groupId}`, group);

    // Add group to user's groups list
    const userGroupsKey = `user:${targetUser.id}:groups`;
    const existingGroups = (await kv.get(userGroupsKey)) || [];
    if (!existingGroups.includes(groupId)) {
      await kv.set(userGroupsKey, [...existingGroups, groupId]);
    }

    return c.json({ member: newMember, group });
  } catch (error) {
    console.error("Add member error:", error);
    return c.json({ error: "Failed to add member to group" }, 500);
  }
});

// Generate or get invite code for a group
app.get("/make-server-9367668c/groups/:id/invite-code", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("id");
    const group = await kv.get(`group:${groupId}`);
    
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    // Check if user is the owner
    if (group.ownerId !== user.id) {
      return c.json({ error: "Only group admins can view invite codes" }, 403);
    }

    // Check if there's an existing valid invite code
    const inviteCodeKey = `group:${groupId}:invite-code`;
    let inviteData = await kv.get(inviteCodeKey);

    if (inviteData && new Date(inviteData.expiresAt) > new Date()) {
      return c.json({ inviteCode: inviteData.code, expiresAt: inviteData.expiresAt });
    }

    // Generate a new 6-letter code
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days

    inviteData = {
      code,
      groupId,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    await kv.set(inviteCodeKey, inviteData);
    await kv.set(`invite-code:${code}`, { groupId, expiresAt });

    return c.json({ inviteCode: code, expiresAt });
  } catch (error) {
    console.error("Get invite code error:", error);
    return c.json({ error: "Failed to get invite code" }, 500);
  }
});

// Refresh invite code for a group
app.post("/make-server-9367668c/groups/:id/invite-code/refresh", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("id");
    const group = await kv.get(`group:${groupId}`);
    
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    // Check if user is the owner
    if (group.ownerId !== user.id) {
      return c.json({ error: "Only group admins can refresh invite codes" }, 403);
    }

    // Delete old invite code
    const oldInviteData = await kv.get(`group:${groupId}:invite-code`);
    if (oldInviteData) {
      await kv.del(`invite-code:${oldInviteData.code}`);
    }

    // Generate a new 6-letter code
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days

    const inviteData = {
      code,
      groupId,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`group:${groupId}:invite-code`, inviteData);
    await kv.set(`invite-code:${code}`, { groupId, expiresAt });

    return c.json({ inviteCode: code, expiresAt });
  } catch (error) {
    console.error("Refresh invite code error:", error);
    return c.json({ error: "Failed to refresh invite code" }, 500);
  }
});

// Join a group with invite code
app.post("/make-server-9367668c/join-group", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { inviteCode } = await c.req.json();

    // Check if invite code exists and is valid
    const inviteData = await kv.get(`invite-code:${inviteCode}`);
    if (!inviteData) {
      return c.json({ error: "Invalid invite code" }, 404);
    }

    if (new Date(inviteData.expiresAt) < new Date()) {
      return c.json({ error: "This invite code has expired" }, 400);
    }

    const groupId = inviteData.groupId;
    const group = await kv.get(`group:${groupId}`);
    
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    // Check if user is already a member
    const isMember = group.members.some((m: any) => m.id === user.id);
    if (isMember) {
      return c.json({ error: "You are already a member of this group" }, 400);
    }

    // Check if user already has a pending request
    const pendingRequestsKey = `group:${groupId}:pending-requests`;
    const pendingRequests = (await kv.get(pendingRequestsKey)) || [];
    const hasPendingRequest = pendingRequests.some((r: any) => r.userId === user.id);
    
    if (hasPendingRequest) {
      return c.json({ error: "You already have a pending request for this group" }, 400);
    }

    // Get user data
    const userData = await kv.get(`user:${user.id}`);

    // Create join request
    const request = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: userData?.name || user.user_metadata.name || user.email,
      userEmail: user.email,
      userPhotoUrl: userData?.photoUrl || user.user_metadata.photoUrl,
      groupId,
      requestedAt: new Date().toISOString(),
    };

    pendingRequests.push(request);
    await kv.set(pendingRequestsKey, pendingRequests);

    return c.json({ success: true, request });
  } catch (error) {
    console.error("Join group error:", error);
    return c.json({ error: "Failed to join group" }, 500);
  }
});

// Get pending requests for a group
app.get("/make-server-9367668c/groups/:id/pending-requests", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("id");
    const group = await kv.get(`group:${groupId}`);
    
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    // Check if user is the owner
    if (group.ownerId !== user.id) {
      return c.json({ error: "Only group admins can view pending requests" }, 403);
    }

    const pendingRequestsKey = `group:${groupId}:pending-requests`;
    const requests = (await kv.get(pendingRequestsKey)) || [];

    return c.json({ requests });
  } catch (error) {
    console.error("Get pending requests error:", error);
    return c.json({ error: "Failed to get pending requests" }, 500);
  }
});

// Approve or deny a join request
app.post("/make-server-9367668c/groups/:groupId/pending-requests/:requestId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const groupId = c.req.param("groupId");
    const requestId = c.req.param("requestId");
    const { approve } = await c.req.json();

    const group = await kv.get(`group:${groupId}`);
    if (!group) {
      return c.json({ error: "Group not found" }, 404);
    }

    // Check if user is the owner
    if (group.ownerId !== user.id) {
      return c.json({ error: "Only group admins can approve/deny requests" }, 403);
    }

    const pendingRequestsKey = `group:${groupId}:pending-requests`;
    const requests = (await kv.get(pendingRequestsKey)) || [];
    const request = requests.find((r: any) => r.id === requestId);

    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    if (approve) {
      // Add user to group
      const newMember = {
        id: request.userId,
        name: request.userName,
      };
      group.members.push(newMember);
      group.lastUpdated = new Date().toISOString();
      
      await kv.set(`group:${groupId}`, group);

      // Add group to user's groups list
      const userGroupsKey = `user:${request.userId}:groups`;
      const existingGroups = (await kv.get(userGroupsKey)) || [];
      if (!existingGroups.includes(groupId)) {
        await kv.set(userGroupsKey, [...existingGroups, groupId]);
      }
    }

    // Remove request from pending list
    const updatedRequests = requests.filter((r: any) => r.id !== requestId);
    await kv.set(pendingRequestsKey, updatedRequests);

    return c.json({ success: true, approved: approve });
  } catch (error) {
    console.error("Handle request error:", error);
    return c.json({ error: "Failed to handle request" }, 500);
  }
});

Deno.serve(app.fetch);
