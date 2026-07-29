export const otpTemplate = (name: string, otp: string,logoUrl: string,) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safe Minds - Verification Code</title>
</head>

<body style="margin:0;padding:0;background:#f4f8fc;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr>
<td align="center">

<table width="650" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:20px;overflow:hidden;
box-shadow:0 10px 35px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td align="center"
style="padding:40px 30px;
background:linear-gradient(135deg,#0D4D8B,#1FA4B8,#7BC043);">

<img
  src="cid:safe-minds-logo"
  alt="Safe Minds"width="110"
style="display:block;background:white;border-radius:16px;padding:10px;">

</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:45px;">

<h2 style="margin:0;color:#0D4D8B;font-size:28px;">
Welcome to Safe Minds 💙
</h2>

<p style="margin-top:30px;font-size:16px;color:#555;line-height:28px;">
Hello <strong>${name}</strong>,
</p>

<p style="font-size:16px;color:#555;line-height:28px;">
Thank you for choosing <strong>Safe Minds</strong>.
</p>

<p style="font-size:16px;color:#555;line-height:28px;">
We're delighted to have you with us. To keep your account secure,
we've generated a one-time verification code for you.
</p>

<h3 style="margin-top:40px;color:#0D4D8B;font-size:20px;text-align:center;">
Your Verification Code
</h3>

<table align="center" cellpadding="0" cellspacing="0"
style="margin:20px auto 35px auto;">

<tr>

<td
style="
background:#F3F8FF;
border:2px dashed #1FA4B8;
border-radius:16px;
padding:22px 55px;
font-size:42px;
font-weight:bold;
letter-spacing:10px;
color:#0D4D8B;
text-align:center;
">

${otp}

</td>

</tr>

</table>

<p style="font-size:16px;color:#555;line-height:28px;">
This verification code is valid for <strong>5 minutes</strong>.
</p>

<p style="font-size:16px;color:#555;line-height:28px;">
Please return to the <strong>Safe Minds</strong> application and enter the code above to complete your verification.
</p>

<p style="font-size:16px;color:#555;line-height:28px;">
If you didn't request this code, you can safely ignore this email.
No changes will be made to your account.
</p>

<hr style="margin:40px 0;border:none;border-top:1px solid #e6edf5;">

<h3 style="color:#0D4D8B;text-align:center;margin-bottom:5px;">
Your Mind Matters
</h3>

<p style="
text-align:center;
color:#1FA4B8;
font-size:18px;
font-weight:600;
margin-top:0;">
Book • Talk • Heal • Grow
</p>

<p style="
font-size:16px;
color:#555;
line-height:28px;
text-align:center;
margin-top:30px;">
Thank you for trusting <strong>Safe Minds</strong> to be a part of your mental wellness journey.
</p>

<p style="
font-size:16px;
color:#555;
line-height:28px;
margin-top:35px;">
Warm regards,<br>
<strong style="color:#0D4D8B;">The Safe Minds Team</strong>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td
align="center"
style="
background:#f8fbfd;
padding:25px;
color:#888;
font-size:13px;
line-height:24px;">

Need assistance?<br>

📧 support@safeminds.com

<br><br>

© 2026 Safe Minds. All rights reserved.

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;