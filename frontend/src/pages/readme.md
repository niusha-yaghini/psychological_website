کلا حالت های مختلف وقت هامون به این شکل هست:
1.	"در انتظار" (آینده – لغو فعال) 
2.	"در انتظار" (گذشته - کمتر از 48 ساعت که روانشناس میتونه تغییر بده به انجام شده یا برگزار نشده)
3.	"در انتظار" (گذشته - بیشتر از 48 ساعت - تبدیل میشه به برگزار نشده)
4.	"تایید شده" (آینده - کمتر از 24 ساعت باقی مونده – لغو غیر فعال)
5.	"تایید شده" (آینده – بیشتر از 24 ساعت مونده – لغو فعال)
6.	"تایید شده" (گذشته - کمتر از 48 ساعت که روانشناس میتونه تغییر بده به انجام شده تبدیل شده یا به برگزار نشده)
7.	"تایید شده" (گذشته – بیشتر از 48 ساعت – تبدیل میشه به برگزار نشده)
8.	انجام شده
9.	در حال برگزاری
10.	کنسل شده (توسط روانشناس)
11.	کنسل شده (توسط بیمار)

---------------------------

یه useEffect ساده که هر ۱ دقیقه currentTime رو آپدیت کنه — لود ناچیز، برای اینکه بفهمیم ایا مثلا کمتر از 1 ساعت مونده به شروع جلسه دکتر که لینک نذاشته یا نه


برای همه وقت های رزرو یه فیلد meetingLink داریم، که بعدا باید خالی شه؟

---------------------------

The logic governing meeting statuses is quite detailed; for instance, statuses such as 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled', and 'no-show' have been defined. Additionally, for completed meetings, there is a 48-hour window for confirming that the meeting took place. Furthermore, meetings cannot be cancelled if there is less than 24 hours remaining until the scheduled time.

--------------------------

The appointment booking logic in the patient panel includes the following:
- Time slots that have already been booked cannot be selected.
- There must be at least one hour remaining before the scheduled session.
- A maximum of three consecutive hours can be selected.
- The terms for canceling an appointment vary depending on the time remaining before the session.