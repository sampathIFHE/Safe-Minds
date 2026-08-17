export const counsellorSessionTemplate = (
  counsellorName: string,
  clientName: string,
  sessionNumber: number,
  sessionDate: string,
  startTime: string,
  endTime: string,
  type: string,
  department?: string,
  school?: string,
  batch?: string,
  referredBy?: string,
  sessionAction: "BOOKED" | "RESCHEDULED" = "BOOKED",
) => {
  const isRescheduled = sessionAction === "RESCHEDULED";

  const heading = isRescheduled
    ? "Counselling Session Rescheduled 🔄"
    : "New Counselling Session Scheduled 💙";

  const introMessage = isRescheduled
    ? `
      A counselling session assigned to you has been rescheduled.
      Please find the updated session details below.
    `
    : `
      A new counselling session has been successfully scheduled and assigned to you.
      Please find the session details below.
    `;

  const sessionStatus = isRescheduled
    ? "Session Rescheduled"
    : "Session Scheduled";

  const detailsHeading = isRescheduled
    ? "Updated Session Details"
    : "Session Details";

  const availabilityMessage = isRescheduled
    ? `
      Please make a note of the updated date and time and be available
      a few minutes before the scheduled session.
    `
    : `
      Please be available a few minutes before the scheduled time
      and be prepared for the counselling session.
    `;

  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>
Safe Minds - ${isRescheduled ? "Session Rescheduled" : "New Session Assigned"}
</title>
</head>

<body style="
margin:0;
padding:0;
background:#f4f8fc;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:20px;
overflow:hidden;
box-shadow:0 10px 35px rgba(0,0,0,0.08);
">

<!-- Header -->
<tr>
<td align="center"
style="
padding:40px 30px;
background:linear-gradient(135deg,#0D4D8B,#1FA4B8,#7BC043);
">

<img
src="cid:safe-minds-logo"
alt="Safe Minds"
width="110"
style="
display:block;
background:white;
border-radius:16px;
padding:10px;
">

</td>
</tr>


<!-- Body -->
<tr>
<td style="padding:45px;">

<h2 style="
margin:0;
color:#0D4D8B;
font-size:18px;
">
${heading}
</h2>


<p style="
margin-top:30px;
font-size:16px;
color:#555;
line-height:28px;
">
Hello <strong>${counsellorName}</strong>,
</p>


<p style="
font-size:16px;
color:#555;
line-height:28px;
">
${introMessage}
</p>


<!-- Status Card -->

<table width="100%" cellpadding="0" cellspacing="0"
style="
margin-top:30px;
background:#F3F8FF;
border-radius:16px;
">

<tr>
<td style="
padding:25px;
text-align:center;
">

<div style="
font-size:14px;
color:#667085;
margin-bottom:8px;
">
Session Status
</div>

<div style="
font-size:20px;
font-weight:bold;
color:#0D4D8B;
">
${sessionStatus}
</div>

<p style="
margin:10px 0 0;
font-size:14px;
color:#667085;
line-height:22px;
">
${
  isRescheduled
    ? "The session time has been updated. Please refer to the details below."
    : "A new session has been assigned to you."
}
</p>

</td>
</tr>

</table>


<!-- Client Details -->

<h3 style="
margin-top:40px;
color:#0D4D8B;
font-size:20px;
">
Client Details
</h3>


<table width="100%" cellpadding="0" cellspacing="0"
style="
background:#f8fbfd;
border-radius:16px;
border-left:5px solid #1FA4B8;
">

<tr>
<td style="
padding:25px;
font-size:16px;
color:#555;
line-height:32px;
">

<strong style="color:#0D4D8B;font-size:18px;">
${clientName}
</strong>

<br>

📝 <strong>Session Number:</strong> ${sessionNumber}

${department ? `<br>🏢 <strong>Department:</strong> ${department}` : ""}

${school ? `<br>🏫 <strong>School:</strong> ${school}` : ""}

${batch ? `<br>🎓 <strong>Batch:</strong> ${batch}` : ""}

${referredBy ? `<br>👤 <strong>Referred By:</strong> ${referredBy}` : ""}

</td>
</tr>

</table>


<!-- Session Details -->

<h3 style="
margin-top:40px;
color:#0D4D8B;
font-size:20px;
">
${detailsHeading}
</h3>


<table width="100%" cellpadding="0" cellspacing="0"
style="
background:#F3F8FF;
border-radius:16px;
">

<tr>
<td style="
padding:25px;
font-size:16px;
color:#555;
line-height:32px;
">

📅 <strong>Date:</strong> ${sessionDate}

<br>

⏰ <strong>Time:</strong> ${startTime} - ${endTime}

<br>


</td>
</tr>

</table>


<p style="
margin-top:35px;
font-size:16px;
color:#555;
line-height:28px;
">
${availabilityMessage}
</p>


<hr style="
margin:40px 0;
border:none;
border-top:1px solid #e6edf5;
">


<h3 style="
color:#0D4D8B;
text-align:center;
margin-bottom:5px;
">
Helping Every Mind Heal
</h3>


<p style="
text-align:center;
color:#1FA4B8;
font-size:18px;
font-weight:600;
margin-top:0;
">
Book • Talk • Heal • Grow
</p>


<p style="
font-size:16px;
color:#555;
line-height:28px;
text-align:center;
margin-top:30px;
">
Thank you for being a valued counsellor with
<strong>Safe Minds</strong> and for supporting our clients
on their wellness journey.
</p>


<p style="
font-size:16px;
color:#555;
line-height:28px;
margin-top:35px;
">
Warm regards,

<br>

<strong style="color:#0D4D8B;">
The Safe Minds Team
</strong>

</p>


</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};