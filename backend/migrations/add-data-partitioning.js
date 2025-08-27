const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data partitioning migration...');

  try {
    // 1. Create partitioned tables for ActivityLog
    console.log('Creating partitioned ActivityLog table...');
    await prisma.$executeRaw`
      -- Create partitioned table for ActivityLog
      CREATE TABLE IF NOT EXISTS "ActivityLog_Partitioned" (
        LIKE "ActivityLog" INCLUDING ALL
      ) PARTITION BY RANGE ("createdAt");
    `;

    // Create partitions for ActivityLog (monthly partitions)
    const currentYear = new Date().getFullYear();
    for (let month = 1; month <= 12; month++) {
      const startDate = `${currentYear}-${month.toString().padStart(2, '0')}-01`;
      const endDate = month === 12 
        ? `${currentYear + 1}-01-01` 
        : `${currentYear}-${(month + 1).toString().padStart(2, '0')}-01`;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ActivityLog_${currentYear}_${month.toString().padStart(2, '0')}" 
        PARTITION OF "ActivityLog_Partitioned"
        FOR VALUES FROM ('${startDate}') TO ('${endDate}');
      `;
    }

    // 2. Create partitioned table for Notifications
    console.log('Creating partitioned Notification table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Notification_Partitioned" (
        LIKE "Notification" INCLUDING ALL
      ) PARTITION BY RANGE ("createdAt");
    `;

    // Create partitions for Notification (weekly partitions)
    for (let week = 1; week <= 52; week++) {
      const startDate = new Date(currentYear, 0, 1 + (week - 1) * 7);
      const endDate = new Date(currentYear, 0, 1 + week * 7);
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Notification_${currentYear}_W${week.toString().padStart(2, '0')}" 
        PARTITION OF "Notification_Partitioned"
        FOR VALUES FROM ('${startDate.toISOString()}') TO ('${endDate.toISOString()}');
      `;
    }

    // 3. Create indexes on partitioned tables
    console.log('Creating indexes on partitioned tables...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_activitylog_partitioned_userid 
      ON "ActivityLog_Partitioned" ("userId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_activitylog_partitioned_object 
      ON "ActivityLog_Partitioned" ("objectType", "objectId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_notification_partitioned_userid 
      ON "Notification_Partitioned" ("userId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_notification_partitioned_read 
      ON "Notification_Partitioned" ("read", "createdAt");
    `;

    // 4. Create materialized views for frequently accessed data
    console.log('Creating materialized views...');
    await prisma.$executeRaw`
      CREATE MATERIALIZED VIEW IF NOT EXISTS "ProjectStats_MV" AS
      SELECT 
        p.id,
        p.name,
        p.status,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT d.id) as document_count,
        COUNT(DISTINCT i.id) as issue_count,
        COUNT(DISTINCT pm."userId") as member_count,
        MAX(t."updatedAt") as last_activity
      FROM "Project" p
      LEFT JOIN "Task" t ON p.id = t."projectId"
      LEFT JOIN "Document" d ON p.id = d."projectId"
      LEFT JOIN "Issue" i ON p.id = i."projectId"
      LEFT JOIN "ProjectMember" pm ON p.id = pm."projectId"
      GROUP BY p.id, p.name, p.status;
    `;

    // Create index on materialized view
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_projectstats_mv_id 
      ON "ProjectStats_MV" (id);
    `;

    // 5. Create function to refresh materialized views
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION refresh_project_stats()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY "ProjectStats_MV";
      END;
      $$ LANGUAGE plpgsql;
    `;

    // 6. Create function to automatically create new partitions
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION create_activitylog_partition(year_val integer, month_val integer)
      RETURNS void AS $$
      DECLARE
        partition_name text;
        start_date date;
        end_date date;
      BEGIN
        partition_name := 'ActivityLog_' || year_val || '_' || LPAD(month_val::text, 2, '0');
        start_date := (year_val || '-' || LPAD(month_val::text, 2, '0') || '-01')::date;
        
        IF month_val = 12 THEN
          end_date := ((year_val + 1) || '-01-01')::date;
        ELSE
          end_date := (year_val || '-' || LPAD((month_val + 1)::text, 2, '0') || '-01')::date;
        END IF;
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF "ActivityLog_Partitioned" FOR VALUES FROM (%L) TO (%L)',
                      partition_name, start_date, end_date);
      END;
      $$ LANGUAGE plpgsql;
    `;

    console.log('Data partitioning migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
