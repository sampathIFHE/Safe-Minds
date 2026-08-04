export const clientSessionTemplate = (
  clientName: string,
  counsellorName: string,
  location: string,
  sessionDate: string,
  startTime: string,
  endTime: string,
  type: string,
) => `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Safe Minds - Session Confirmation</title>
</head>

<body style="margin:0;padding:0;background:#f4f8fc;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table width="750" cellpadding="0" cellspacing="0"
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
font-size:28px;
">
Your Counselling Session is Confirmed 💙
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
Your counselling session with <strong>Safe Minds</strong> has been successfully scheduled.
We are happy to support you on your mental wellness journey.
</p>


<!-- Status Card -->

<table width="100%" cellpadding="0" cellspacing="0"
style="
margin-top:30px;
background:#F3F8FF;
border-radius:16px;
">

<tr>
<td align="center"
style="padding:25px;">

<span style="
background:#7BC043;
color:white;
padding:10px 25px;
border-radius:30px;
font-size:14px;
font-weight:bold;
">

CONFIRMED

</span>

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

<strong style="color:#0D4D8B;font-size:18px;">
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
Session Details
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

💻 <strong>Mode:</strong> ${type}

</td>
</tr>

</table>



<p style="
margin-top:35px;
font-size:16px;
color:#555;
line-height:28px;
">

Please be available at the scheduled time.
We look forward to being a part of your healing journey.

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