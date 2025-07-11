import { eq, desc } from "drizzle-orm";
import { getDatabase } from "./db";
import { calls, contacts, users, type User, type InsertUser, type Call, type InsertCall, type Contact, type InsertContact } from "@shared/schema";
import type { IStorage } from "./storage";

export class MySQLStorage implements IStorage {
  private get db() {
    return getDatabase();
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user);
    const insertId = result[0].insertId as number;
    
    const newUser = await this.getUser(insertId);
    if (!newUser) {
      throw new Error("Failed to create user");
    }
    return newUser;
  }

  async createCall(call: InsertCall): Promise<Call> {
    const result = await this.db.insert(calls).values(call);
    const insertId = result[0].insertId as number;
    
    const newCall = await this.getCall(insertId);
    if (!newCall) {
      throw new Error("Failed to create call");
    }
    return newCall;
  }

  async getCall(id: number): Promise<Call | undefined> {
    const result = await this.db.select().from(calls).where(eq(calls.id, id)).limit(1);
    return result[0];
  }

  async getCallByCallId(callId: string): Promise<Call | undefined> {
    const result = await this.db.select().from(calls).where(eq(calls.callId, callId)).limit(1);
    return result[0];
  }

  async getCallsByUserId(userId: number): Promise<Call[]> {
    const result = await this.db
      .select()
      .from(calls)
      .where(eq(calls.userId, userId))
      .orderBy(desc(calls.startTime));
    return result;
  }

  async updateCall(id: number, updates: Partial<Call>): Promise<Call | undefined> {
    await this.db.update(calls).set(updates).where(eq(calls.id, id));
    return this.getCall(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await this.db.insert(contacts).values(contact);
    const insertId = result[0].insertId as number;
    
    const newContact = await this.getContact(insertId);
    if (!newContact) {
      throw new Error("Failed to create contact");
    }
    return newContact;
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const result = await this.db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async getContactsByUserId(userId: number): Promise<Contact[]> {
    const result = await this.db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId));
    return result;
  }

  async getContactByPhoneNumber(userId: number, phoneNumber: string): Promise<Contact | undefined> {
    const result = await this.db
      .select()
      .from(contacts)
      .where(eq(contacts.userId, userId))
      .where(eq(contacts.phoneNumber, phoneNumber))
      .limit(1);
    return result[0];
  }
}