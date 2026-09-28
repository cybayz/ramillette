import prisma from "@/lib/db/prisma";

export interface LogAuditParams {
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  storeId?: string | null;
}

/**
 * Persists an immutable audit log record.
 * Fails gracefully without throwing so business operations are never halted.
 */
export async function recordAuditLog(params: LogAuditParams) {
  try {
    const payload = {
      summary: params.summary,
      userName: params.userName || undefined,
      userEmail: params.userEmail || undefined,
      ...(params.newValue && typeof params.newValue === "object"
        ? params.newValue
        : params.newValue !== undefined
        ? { value: params.newValue }
        : {}),
    };

    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: String(params.entityId),
        oldValue: params.oldValue !== undefined ? params.oldValue : undefined,
        newValue: payload,
        ipAddress: params.ipAddress || null,
        storeId: params.storeId || null,
      },
    });
  } catch (error) {
    console.error("Non-blocking audit log recording error:", error);
    return null;
  }
}
