# واجهة المزامنة مع نظام المتكامل
كل طلب: POST مع ترويسة `Authorization: Bearer <SYNC_API_KEY>` و JSON.
رمز المستشفى: H1 / H2 / H3.

- /api/public/sync/vitals   {hospital, day, revenue, returns, surgeries, emergency, beds, attendance, electricity}
- /api/public/sync/cashbox  {hospital, day, cash, wallets, cheques, insurance, deferred, pledges}
- /api/public/sync/returns  {hospital, items:[{external_ref, kind, amount, quantity, reason}]}
- /api/public/sync/expenses {hospital, items:[{external_ref, period: daily|monthly|yearly, category, item, amount, invoice_no, spent_on, details}]}
- /api/public/sync/attendance {hospital, items:[{employee_code, employee_name, job_title, day, shift: day|night, check_in, check_out, status: present|late|absent|leave, late_minutes}]}
- /api/public/sync/notifications {hospital, items:[{external_ref, source: staff|gov, kind, body, sender, remind_at}]}

## حقول المؤشرات
- beds: مفاتيح nursery / children / general / icu / morgue، لكل منها {capacity, occupied, discharged, admitted}. occupied هو عدد المشغول الحالي، لا تُضاف إليه حركة الدخول والخروج مجدداً.
- attendance: {present, late, absent, leave} بالنسب المئوية.
- surgeries: {major, medium, minor}؛ emergency: {accepted, rejected, transferred}؛ electricity: {system, commercial, government}.
- تكرار external_ref للمرتجعات أو الإشعارات لا يمسح القرار أو الرد السابق.
- الردود محفوظة في التطبيق فقط؛ إيصالها إلى المتكامل يحتاج قناة إرسال من برنامج المزامنة.
- الحسابات الجديدة لا تحصل على صلاحية لأي مستشفى تلقائياً؛ يلزم تعيين hospital_access من إدارة التطبيق.
- ملف HTML المنزّل نسخة تجريبية مستقلة، ولا يتضمن بيانات المستشفى أو معلومات الدخول.
