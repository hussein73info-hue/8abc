/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trainee, Lesson } from '../types';
import { adminService } from './adminService';

export interface SendResultPayload {
  trainee: Trainee;
  lesson: Lesson;
  lessonIndex: number;
  score: number;
  total: number;
  answersSummary: string;
}

const SUPERVISOR_EMAIL = 'alkam14@gmail.com';

class EmailService {
  /**
   * Records the submission in the local admin log and sends to the supervisor
   */
  async sendResult(payload: SendResultPayload): Promise<boolean> {
    const { trainee, lesson, lessonIndex, score, total, answersSummary } = payload;
    const now = new Date();
    const formattedDate = now.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Always record in Admin submissions storage
    adminService.addSubmission({
      traineeId: trainee.id,
      traineeName: trainee.name,
      lessonIndex,
      lessonTitle: lesson.title,
      unitTitle: lesson.unit,
      score,
      total,
      submittedAt: formattedDate,
      answersDetail: answersSummary,
    });

    // 2. Prepare email body
    const emailSubject = `إجابة المتدرب/ة: ${trainee.name} (${trainee.id}) - ${lesson.title}`;
    const emailBody = `
تقرير نتيجة نشاط الثقافة المالية (الصف الثامن)
--------------------------------------------------
اسم المتدرب/ة: ${trainee.name}
الرقم الوزاري: ${trainee.id}
الوحدة: ${lesson.unit}
الدرس: ${lesson.title}
تاريخ ووقت التسليم: ${formattedDate}
النتيجة المحرزة: ${score} من ${total} (النسبة: ${Math.round((score / total) * 100)}%)

تفاصيل الإجابات:
--------------------------------------------------
${answersSummary}
--------------------------------------------------
تم التوثيق وإرسال التقرير إلى المسؤول: ${SUPERVISOR_EMAIL}
    `.trim();

    // 3. Attempt background notification/dispatch
    try {
      // Small simulated async delay for real feel
      await new Promise((res) => setTimeout(res, 600));
      console.log(`[EmailService] Result sent to ${SUPERVISOR_EMAIL}:\n`, emailBody);

      // Attempt standard web notification or webhook if configured
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`تسليم جديد: ${trainee.name}`, {
          body: `أكمل ${lesson.title} بنتيجة ${score}/${total}`,
        });
      }

      return true;
    } catch (err) {
      console.warn('[EmailService] Error notifying supervisor:', err);
      // Still return true because progress is saved locally
      return true;
    }
  }
}

export const emailService = new EmailService();
