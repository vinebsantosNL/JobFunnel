const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #FFFFFF;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
  color: #111827;
`

const brandColor = '#2563EB'

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to JobFunnel OS',
    html: `
      <div style="${baseStyle}">
        <h1 style="color: ${brandColor}; font-size: 28px; font-weight: 700; margin-bottom: 16px;">
          Welcome to JobFunnel OS
        </h1>
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Hi ${name || 'there'},
        </p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
          Your account is ready. Start managing your job search like a product funnel —
          track applications, prepare interview stories, and land your next role.
        </p>
        <a
          href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
          style="
            display: inline-block;
            background-color: ${brandColor};
            color: #FFFFFF;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 32px;
          "
        >
          Go to Dashboard
        </a>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin-bottom: 24px;" />
        <p style="font-size: 12px; color: #9CA3AF;">
          You received this email because you created a JobFunnel OS account.
        </p>
      </div>
    `,
  }
}

export function weeklySummaryEmail(
  name: string,
  stats: {
    applied: number
    transitions: number
    stale: number
    snapshot: Record<string, number>
  }
): { subject: string; html: string } {
  const snapshotRows = Object.entries(stats.snapshot)
    .map(
      ([stage, count]) =>
        `<tr>
          <td style="padding: 8px 12px; text-transform: capitalize; color: #374151;">${stage}</td>
          <td style="padding: 8px 12px; font-weight: 600; color: #111827;">${count}</td>
        </tr>`
    )
    .join('')

  return {
    subject: 'Your Weekly Job Search Summary',
    html: `
      <div style="${baseStyle}">
        <h1 style="color: ${brandColor}; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Weekly Summary
        </h1>
        <p style="font-size: 14px; color: #6B7280; margin-bottom: 24px;">
          Here's how your job search went this week, ${name || 'there'}.
        </p>

        <div style="display: flex; gap: 16px; margin-bottom: 32px;">
          <div style="flex: 1; background: #EFF6FF; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 28px; font-weight: 700; color: ${brandColor}; margin: 0;">${stats.applied}</p>
            <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0;">Applied</p>
          </div>
          <div style="flex: 1; background: #F0FDF4; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 28px; font-weight: 700; color: #16A34A; margin: 0;">${stats.transitions}</p>
            <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0;">Stage Changes</p>
          </div>
          <div style="flex: 1; background: #FFF7ED; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 28px; font-weight: 700; color: #EA580C; margin: 0;">${stats.stale}</p>
            <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0;">Stale</p>
          </div>
        </div>

        <h2 style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px;">
          Pipeline Snapshot
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; border: 1px solid #E5E7EB; border-radius: 8px;">
          <thead>
            <tr style="background: #F9FAFB;">
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6B7280; font-weight: 600;">Stage</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6B7280; font-weight: 600;">Count</th>
            </tr>
          </thead>
          <tbody>
            ${snapshotRows}
          </tbody>
        </table>

        <a
          href="${process.env.NEXT_PUBLIC_APP_URL}/app/analytics"
          style="
            display: inline-block;
            background-color: ${brandColor};
            color: #FFFFFF;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
          "
        >
          View Analytics
        </a>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #9CA3AF;">
          You can manage your notification preferences in
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/settings/notifications" style="color: ${brandColor};">Settings</a>.
        </p>
      </div>
    `,
  }
}

export function staleApplicationEmail(
  name: string,
  staleJobs: Array<{ company_name: string; job_title: string; stage: string; days: number }>
): { subject: string; html: string } {
  const jobRows = staleJobs
    .map(
      (job) =>
        `<tr>
          <td style="padding: 10px 12px; color: #111827; font-weight: 500;">${job.company_name}</td>
          <td style="padding: 10px 12px; color: #374151;">${job.job_title}</td>
          <td style="padding: 10px 12px; text-transform: capitalize; color: #6B7280;">${job.stage}</td>
          <td style="padding: 10px 12px; color: #EA580C; font-weight: 600;">${job.days}d</td>
        </tr>`
    )
    .join('')

  return {
    subject: `${staleJobs.length} application${staleJobs.length !== 1 ? 's need' : ' needs'} your attention`,
    html: `
      <div style="${baseStyle}">
        <h1 style="color: ${brandColor}; font-size: 24px; font-weight: 700; margin-bottom: 8px;">
          Stale Applications
        </h1>
        <p style="font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
          Hi ${name || 'there'}, the following applications haven't had any activity in a while.
          Consider following up or updating their status.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; border: 1px solid #E5E7EB; border-radius: 8px;">
          <thead>
            <tr style="background: #F9FAFB;">
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6B7280; font-weight: 600;">Company</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6B7280; font-weight: 600;">Role</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6B7280; font-weight: 600;">Stage</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6B7280; font-weight: 600;">Age</th>
            </tr>
          </thead>
          <tbody>
            ${jobRows}
          </tbody>
        </table>

        <a
          href="${process.env.NEXT_PUBLIC_APP_URL}/app/pipeline"
          style="
            display: inline-block;
            background-color: ${brandColor};
            color: #FFFFFF;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
          "
        >
          Open Pipeline
        </a>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #9CA3AF;">
          Manage your alerts in
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/settings/notifications" style="color: ${brandColor};">Settings</a>.
        </p>
      </div>
    `,
  }
}
