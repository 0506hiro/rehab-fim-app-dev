import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const facilities = sqliteTable('facilities', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  name:      text('name').notNull(),
  type:      text('type', { enum: ['recovery', 'living'] }).notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const users = sqliteTable('users', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  email:      text('email').notNull().unique(),
  name:       text('name').notNull(),
  facilityId: integer('facility_id').references(() => facilities.id),
  role:       text('role', { enum: ['admin', 'staff'] }).notNull().default('staff'),
  createdAt:  text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const patients = sqliteTable('patients', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  patientCode:   text('patient_code').notNull(),
  facilityId:    integer('facility_id').notNull().references(() => facilities.id),
  gender:        text('gender', { enum: ['male', 'female', 'other'] }).notNull(),
  birthDate:     text('birth_date').notNull(),
  diagnosis:     text('diagnosis').notNull(),
  onsetDate:     text('onset_date'),
  dischargeDate: text('discharge_date').notNull(),
  notes:         text('notes'),
  createdBy:     integer('created_by').references(() => users.id),
  createdAt:     text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt:     text('deleted_at'),
})

export const fimEvaluations = sqliteTable('fim_evaluations', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  patientId:      integer('patient_id').notNull().references(() => patients.id),
  facilityId:     integer('facility_id').notNull().references(() => facilities.id),
  evaluatorId:    integer('evaluator_id').references(() => users.id),
  evaluationDate: text('evaluation_date').notNull(),
  evaluationType: text('evaluation_type', { enum: ['baseline', 'quarterly'] }).notNull(),

  // 運動：セルフケア
  eating:        integer('eating').notNull(),
  grooming:      integer('grooming').notNull(),
  bathing:       integer('bathing').notNull(),
  dressingUpper: integer('dressing_upper').notNull(),
  dressingLower: integer('dressing_lower').notNull(),
  toileting:     integer('toileting').notNull(),

  // 運動：排泄コントロール
  bladder: integer('bladder').notNull(),
  bowel:   integer('bowel').notNull(),

  // 運動：移乗
  transferBedChair: integer('transfer_bed_chair').notNull(),
  transferToilet:   integer('transfer_toilet').notNull(),
  transferTub:      integer('transfer_tub').notNull(),

  // 運動：移動
  locomotionWalk:   integer('locomotion_walk').notNull(),
  locomotionStairs: integer('locomotion_stairs').notNull(),

  // 認知：コミュニケーション
  comprehension: integer('comprehension').notNull(),
  expression:    integer('expression').notNull(),

  // 認知：社会的認知
  socialInteraction: integer('social_interaction').notNull(),
  problemSolving:    integer('problem_solving').notNull(),
  memory:            integer('memory').notNull(),

  // 合計
  motorTotal:     integer('motor_total').notNull(),
  cognitiveTotal: integer('cognitive_total').notNull(),
  totalFim:       integer('total_fim').notNull(),

  notes:     text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
})

export const auditLogs = sqliteTable('audit_logs', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  userId:     integer('user_id').references(() => users.id),
  action:     text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId:   integer('target_id').notNull(),
  createdAt:  text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type Facility      = typeof facilities.$inferSelect
export type User          = typeof users.$inferSelect
export type Patient       = typeof patients.$inferSelect
export type FimEvaluation = typeof fimEvaluations.$inferSelect
