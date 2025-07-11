import { calls, contacts, users, type User, type InsertUser, type Call, type InsertCall, type Contact, type InsertContact } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createCall(call: InsertCall): Promise<Call>;
  getCall(id: number): Promise<Call | undefined>;
  getCallByCallId(callId: string): Promise<Call | undefined>;
  getCallsByUserId(userId: number): Promise<Call[]>;
  updateCall(id: number, updates: Partial<Call>): Promise<Call | undefined>;
  
  createContact(contact: InsertContact): Promise<Contact>;
  getContactsByUserId(userId: number): Promise<Contact[]>;
  getContactByPhoneNumber(userId: number, phoneNumber: string): Promise<Contact | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calls: Map<number, Call>;
  private contacts: Map<number, Contact>;
  private currentUserId: number;
  private currentCallId: number;
  private currentContactId: number;

  constructor() {
    this.users = new Map();
    this.calls = new Map();
    this.contacts = new Map();
    this.currentUserId = 1;
    this.currentCallId = 1;
    this.currentContactId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.currentCallId++;
    const call: Call = { 
      ...insertCall, 
      id, 
      startTime: new Date(),
      endTime: null,
      duration: null,
      telnyxCallId: insertCall.telnyxCallId || null
    };
    this.calls.set(id, call);
    return call;
  }

  async getCall(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async getCallByCallId(callId: string): Promise<Call | undefined> {
    return Array.from(this.calls.values()).find(call => call.callId === callId);
  }

  async getCallsByUserId(userId: number): Promise<Call[]> {
    return Array.from(this.calls.values())
      .filter(call => call.userId === userId)
      .sort((a, b) => {
        const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
        return bTime - aTime;
      });
  }

  async updateCall(id: number, updates: Partial<Call>): Promise<Call | undefined> {
    const call = this.calls.get(id);
    if (!call) return undefined;
    
    const updatedCall = { ...call, ...updates };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id,
      email: insertContact.email || null,
      company: insertContact.company || null
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContactsByUserId(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.userId === userId);
  }

  async getContactByPhoneNumber(userId: number, phoneNumber: string): Promise<Contact | undefined> {
    return Array.from(this.contacts.values()).find(
      contact => contact.userId === userId && contact.phoneNumber === phoneNumber
    );
  }
}

import { MySQLStorage } from "./mysql-storage";

// Use MySQL storage if DATABASE_URL is provided, otherwise use in-memory storage
export const storage = process.env.DATABASE_URL ? new MySQLStorage() : new MemStorage();
