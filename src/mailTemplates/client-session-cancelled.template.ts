export const clientSessionCancelledTemplate = (
  clientName: string,
  counsellorName: string,
  sessionDate: string,
  startTime: string,
  endTime: string,
  type: string,
  cancelledBy: "CLIENT" | "COUNSELLOR",
  cancellationReason: string,
  location?: string,
) => {
  const cancelledByText =
    cancelledBy === "CLIENT"
      ? "You cancelled this counselling session."
      : "Your counsellor cancelled this counselling session.";

  const cancellationTitle =
    cancelledBy === "CLIENT"
      ? "Session Cancelled"
      : "Your Session Was Cancelled";

  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>
Safe Minds - Session Cancelled
</title>

</head>

<body
  style="
    margin:0;
    padding:0;
background:linear-gradient(135deg,#0d3866 0%,#127d8a 55%,#4caf50 100%);
    font-family:Arial,Helvetica,sans-serif;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="padding:40px 20px;"
>

<tr>
<td align="center">

<table
  width="600"
  cellpadding="0"
  cellspacing="0"
  style="
    background:#ffffff;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 10px 35px rgba(0,0,0,0.08);
  "
>

<!-- Header -->

<tr>

<td
  align="center"
  style="
    padding:40px 30px;
    background:
      linear-gradient(
        135deg,
        #0D4D8B,
        #1FA4B8,
        #7BC043
      );
  "
>

<img
  src="cid:safe-minds-logo"
  alt="Safe Minds"
  width="110"
  style="
    display:block;
    background:white;
    border-radius:16px;
    padding:10px;
  "
>

</td>

</tr>


<!-- Body -->

<tr>

<td style="padding:45px;">

<h2
  style="
    margin:0;
    color:#0D4D8B;
    font-size:22px;
  "
>
${cancellationTitle}
</h2>


<p
  style="
    margin-top:30px;
    font-size:16px;
    color:#555;
    line-height:28px;
  "
>

Hello <strong>${clientName}</strong>,

</p>


<p
  style="
    font-size:16px;
    color:#555;
    line-height:28px;
  "
>

${cancelledByText}

</p>


<!-- Status -->

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    margin-top:30px;
    background:#FFF4F2;
    border-radius:16px;
    border-left:5px solid #D92D20;
  "
>

<tr>

<td
  style="
    padding:22px 25px;
    font-size:16px;
    color:#555;
    line-height:28px;
  "
>

<strong
  style="
    color:#D92D20;
    font-size:18px;
  "
>
SESSION CANCELLED
</strong>

<br>

${cancelledBy === "CLIENT"
  ? "You have cancelled this session."
  : "The counsellor has cancelled this session."
}

</td>

</tr>

</table>


<!-- Counsellor -->

<h3
  style="
    margin-top:40px;
    color:#0D4D8B;
    font-size:20px;
  "
>
Counsellor
</h3>


<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background:#f8fbfd;
    border-radius:16px;
    border-left:5px solid #1FA4B8;
  "
>

<tr>

<td
  style="
    padding:25px;
    font-size:16px;
    color:#555;
    line-height:28px;
  "
>

<strong
  style="
    color:#0D4D8B;
    font-size:18px;
  "
>
${counsellorName}
</strong>

</td>

</tr>

</table>


<!-- Session Details -->

<h3
  style="
    margin-top:40px;
    color:#0D4D8B;
    font-size:20px;
  "
>
Cancelled Session Details
</h3>


<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background:#F3F8FF;
    border-radius:16px;
  "
>

<tr>

<td
  style="
    padding:25px;
    font-size:16px;
    color:#555;
    line-height:32px;
  "
>

📅 <strong>Date:</strong>
${sessionDate}

<br>

⏰ <strong>Time:</strong>
${startTime} - ${endTime}

<br>


${
  location
    ? `
<br>

📍 <strong>Location:</strong>
${location}
`
    : ""
}

</td>

</tr>

</table>


<!-- Cancellation Reason -->

<h3
  style="
    margin-top:40px;
    color:#0D4D8B;
    font-size:20px;
  "
>
Cancellation Reason
</h3>


<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background:#FFF9F7;
    border-radius:16px;
    border-left:5px solid #F79009;
  "
>

<tr>

<td
  style="
    padding:25px;
    font-size:16px;
    color:#555;
    line-height:28px;
  "
>

${
  cancellationReason
    ? cancellationReason
    : "No reason was provided."
}

</td>

</tr>

</table>


<p
  style="
    margin-top:35px;
    font-size:16px;
    color:#555;
    line-height:28px;
  "
>

If you would like to schedule another counselling
session, you can book a new session through
<strong>Safe Minds</strong>.

</p>


<hr
  style="
    margin:40px 0;
    border:none;
    border-top:1px solid #e6edf5;
  "
>


<h3
  style="
    color:#0D4D8B;
    text-align:center;
    margin-bottom:5px;
  "
>
Your Mind Matters
</h3>


<p
  style="
    text-align:center;
    color:#1FA4B8;
    font-size:18px;
    font-weight:600;
    margin-top:0;
  "
>
Book • Talk • Heal • Grow
</p>


<p
  style="
    font-size:16px;
    color:#555;
    line-height:28px;
    text-align:center;
    margin-top:30px;
  "
>

Thank you for trusting
<strong>Safe Minds</strong>
with your mental wellness journey.

</p>


<p
  style="
    font-size:16px;
    color:#555;
    line-height:28px;
    margin-top:35px;
  "
>

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