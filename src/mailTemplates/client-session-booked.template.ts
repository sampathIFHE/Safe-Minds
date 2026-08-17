export const clientSessionTemplate = (
  clientName: string,
  counsellorName: string,
  location: string,
  sessionDate: string,
  startTime: string,
  endTime: string,
  type: string,
  sessionAction: "BOOKED" | "RESCHEDULED" = "BOOKED",
) => {
  const isRescheduled = sessionAction === "RESCHEDULED";

  const heading = isRescheduled
    ? "Your Counselling Session has been Rescheduled 🔄"
    : "Your Counselling Session is Confirmed 💙";

  const introMessage = isRescheduled
    ? `Your counselling session with <strong>Safe Minds</strong> has been successfully rescheduled. Please find your updated session details below.`
    : `Your counselling session with <strong>Safe Minds</strong> has been successfully scheduled. We are happy to support you on your mental wellness journey.`;

  const statusTitle = isRescheduled
    ? "Session Rescheduled"
    : "Session Confirmed";

  const statusMessage = isRescheduled
    ? "Your previous session time has been updated. Please make a note of the new date and time."
    : "Your counselling session has been successfully scheduled.";

  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>
Safe Minds - ${
    isRescheduled
      ? "Session Rescheduled"
      : "Session Confirmation"
  }
</title>

</head>

<body style="
margin:0;
padding:0;
background:linear-gradient(135deg,#0d3866 0%,#127d8a 55%,#4caf50 100%);
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
background:#0D4D8B;
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
Hello <strong>${clientName}</strong>,
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
${statusTitle}
</div>

<p style="
margin:10px 0 0;
font-size:14px;
color:#667085;
line-height:22px;
">
${statusMessage}
</p>

</td>
</tr>

</table>


<h3 style="
margin-top:40px;
color:#0D4D8B;
font-size:20px;
">
Your Counsellor
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
line-height:28px;
">

<strong style="color:#0D4D8B;">
${counsellorName}
</strong>

<br>

📍 ${location}

</td>
</tr>

</table>


<h3 style="
margin-top:40px;
color:#0D4D8B;
font-size:20px;
">
${isRescheduled ? "Updated Session Details" : "Session Details"}
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

<strong style="color:#0D4D8B;font-size:18px;">
Counsellor Name:
</strong> ${counsellorName}

<br>

⏰ <strong>Time:</strong> ${startTime} - ${endTime}

<br>

📍 <strong style="color:#0D4D8B;font-size:18px;">
Place:
</strong> ${location}

<br>

💻 <strong style="color:#0D4D8B;font-size:18px;">
Booking Type:
</strong> ${type}

</td>
</tr>

</table>


<p style="
margin-top:35px;
font-size:16px;
color:#555;
line-height:28px;
">

${
  isRescheduled
    ? "Please make sure you are available at the new scheduled time. We appreciate your understanding and look forward to supporting you."
    : "Please be available at the scheduled time. We look forward to being a part of your healing journey."
}

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
Your Mind Matters
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

Thank you for trusting
<strong>Safe Minds</strong>
with your mental wellness journey.

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