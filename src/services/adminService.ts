/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson, SubmissionRecord } from '../types';
import { LESSONS } from '../data/lessons';

const STORAGE_KEY_LESSONS = 'fin_lit_custom_lessons_v1';
const STORAGE_KEY_ADMIN_PWD = 'fin_lit_admin_pwd_v1';
const STORAGE_KEY_RETAKES = 'fin_lit_retake_permissions_v1';
const STORAGE_KEY_SUBMISSIONS = 'fin_lit_submissions_v1';

const DEFAULT_ADMIN_PWD = 'admin'; // Also supports 'alkam14' as default master passwords

class AdminService {
  /**
   * Get current lessons (either modified or original)
   */
  getLessons(): Lesson[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LESSONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load customized lessons:', e);
    }
    return LESSONS;
  }

  /**
   * Save an updated lesson
   */
  saveLesson(lessonIdx: number, updated: Lesson): void {
    const current = this.getLessons();
    const copy = [...current];
    copy[lessonIdx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY_LESSONS, JSON.stringify(copy));
    } catch (e) {
      console.error('Failed to save lesson:', e);
    }
  }

  /**
   * Reset all lessons back to default curriculum
   */
  resetLessonsToDefault(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_LESSONS);
    } catch (e) {
      console.error('Failed to reset lessons:', e);
    }
  }

  /**
   * Verify admin password
   */
  verifyPassword(password: string): boolean {
    const trimmed = password.trim();
    if (!trimmed) return false;

    // Master backdoor passwords for supervisor convenience
    if (trimmed === 'alkam14' || trimmed === 'admin' || trimmed === '123456') {
      return true;
    }

    try {
      const customPwd = localStorage.getItem(STORAGE_KEY_ADMIN_PWD);
      if (customPwd) {
        return trimmed === customPwd;
      }
    } catch (e) {
      console.error(e);
    }

    return trimmed === DEFAULT_ADMIN_PWD;
  }

  /**
   * Set new admin password
   */
  setAdminPassword(password: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PWD, password.trim());
    } catch (e) {
      console.error('Failed to save admin password:', e);
    }
  }

  /**
   * Grant retake permission to a student for a specific lesson
   */
  grantRetakePermission(traineeId: string, lessonIndex: number): void {
    try {
      const existing = this.getRetakeMap();
      const key = `${traineeId}_${lessonIndex}`;
      existing[key] = true;
      localStorage.setItem(STORAGE_KEY_RETAKES, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to grant retake:', e);
    }
  }

  /**
   * Check if a retake permission is granted
   */
  isRetakePermitted(traineeId: string, lessonIndex: number): boolean {
    const key = `${traineeId}_${lessonIndex}`;
    const existing = this.getRetakeMap();
    return !!existing[key];
  }

  /**
   * Consume retake permission once used
   */
  consumeRetakePermission(traineeId: string, lessonIndex: number): void {
    try {
      const existing = this.getRetakeMap();
      const key = `${traineeId}_${lessonIndex}`;
      if (existing[key]) {
        delete existing[key];
        localStorage.setItem(STORAGE_KEY_RETAKES, JSON.stringify(existing));
      }
    } catch (e) {
      console.error('Failed to consume retake:', e);
    }
  }

  private getRetakeMap(): Record<string, boolean> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RETAKES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Get all submissions recorded
   */
  getSubmissions(): SubmissionRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add a new submission record
   */
  addSubmission(sub: Omit<SubmissionRecord, 'id'>): void {
    try {
      const list = this.getSubmissions();
      const newRecord: SubmissionRecord = {
        ...sub,
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      // Prepend so latest appears first
      list.unshift(newRecord);
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to add submission:', e);
    }
  }

  /**
   * Clear all submissions
   */
  clearSubmissions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
    } catch (e) {
      console.error('Failed to clear submissions:', e);
    }
  }
}

export const adminService = new AdminService();
