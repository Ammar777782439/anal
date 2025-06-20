### **التصور العام للتطبيق (Application Concept)**


- [[Registration لتسجيل جهاز جديد في المنصة]].
- [[Firewall لحماية الـ API الخاص بنا من الهجمات]]
- [[Scan للسماح للمستخدم بطلب فحص أمني لجهازه عن بعد]]
- **FindMe**: للسماح للمستخدم بتحديد موقع جهازه المفقود.




---


### شوية تفاصيل بخصوص ميزة الفحص اللي طلبت
### **أول شيء: أيش بالضبط المطلوب نفحص؟**

> "لما تقول لي نعمل فحص، هل المقصود نبحث عن حاجة معينة ؟ يعني أيش الخطر اللي نحاول نكشفه ؟"

وإحتمالات الخيارات تشرحها زي كذا:

- **هل نقصد نعمل فحص على البورتات المفتوحة؟**
    
    > "يعني نتأكد إنه ما بش أبواب مفتوحة في الجهاز ممكن تفتح ثغرات؟"
    
- **أو تقصد نتأكد إن الجهاز محدّث؟**
    
    > يعني نشوف إذا نسخة النظام عند الموظف محدثة أو فيها تحديثات أمنية ناقصة؟ 
    
- **أو نبحث عن برامج ممنوعة أو مش موثوقة؟**
    
    > "مثلاً واحد مركب برنامج تورنت أو لعبة؟ نكشف هذي ونرفع تقرير فيها؟"
    
- **أو نشيك إذا برنامج مكافحة الفيروسات شغال ومحدث؟**
    

> "أو ممكن كلهم؟  او في شي غير هولا "




### 🔁 ثاني شيء: أيش نسوي لما نكتشف الحاجة الي فحصناها طلعت  وطلعت مشبوهة؟

> "يعني لو الجهاز فيه مشكلة، مثل برنامج مش مسموح، أيش الإجراء اللي تتوقعه؟"

- نسجل الحالة بس في تقرير؟
    
- ولا نرسل تنبيه؟
    
- أو نوقف الخدمة؟ (لو الوضع حساس)



### 🧰 **ثالث شيء: كيف بيتم الفحص؟**

> "هل الخطة إنه نحط برنامج صغير (Agent) في كل جهاز، وهو يشيك ويرسل لنا النتائج؟"

- ولا بنعمل الفحص عن بعد؟
    
    > "اذ كان عن بعد مايعطيك معلومات كثيره  بذات اذ الجهاز في شبكه مختلفه ."
    












---

### ✅ تمام، نجي الآن لـ **ميزة الفحص (Scan)** بحسب تخيّلي وفهمي لها:

الفكرة بسيطة بس :  
نخلي المستخدم يفتح لوحة التحكم، ويضغط زر جنب أي جهاز مسجّل عنده (زي سيرفر أو كمبيوتر)، ولما يضغط الزر، **نرسل أمر لهذا الجهاز يفحص نفسه من ناحية أمان**، ويرجع لنا النتيجة.

🔍 طيب، إيش يعني "يفحص نفسه"؟  
ناخذ أبسط مثال معروف:

> **فحص المنافذ المفتوحة (Port Scanning)**  
> نكتشف لو في "أبواب" في الجهاز مفتوحة، وهي أصلاً ما يفترض تكون مفتوحة، لأن هذي ممكن يستخدمها المخترقين يدخلوا منها.

---

### ⚙️ **الخطة كاملة لميزة الفحص (Scan Plan)**

الميزة هذي ما تشتغل مباشرة بلحظتها، لأنه الفحص الأمني ممكن يأخذ وقت (ثواني أو حتى دقايق)، والمستخدم ما ينفع نخليه منتظر طول هذا الوقت.  
لهذا السبب، اعتمدت على تصميم معروف في البرمجة اسمه:

> **"مهام في الخلفية" (Background Jobs)**

#### الأطراف اللي تشارك في القصة:

1. **المستخدم:** صاحب الجهاز.
    
2. **الواجهة (Frontend):** هي لوحة التحكم اللي يتعامل معها.
    
3. **الـ API (نظامنا بـ Go):** يستقبل الطلب، لكن مش هو اللي يسوي الفحص بنفسه.
    
4. **طابور المهام (Job Queue):** زي قائمة انتظار.
    
5. **العامل (Worker):** هو اللي شغال دايم في الخلفية وينفذ المهام وحدة وحدة.بدل ال api يستقبل المهام من ال api 
    

---

### 🪜 التصور:

#### 1️⃣ أول حاجة: المستخدم يطلب الفحص

- يدخل على لوحة التحكم.
    
- يروح لصفحة "أجهزتي".
    
- يضغط زر "ابدأ الفحص الآن" بجانب جهازه.
    

الواجهة تبعث طلب للـ API:

```
POST /api/v1/devices/{deviceId}/scan
```

✅ والطلب لازم يكون مصادق (عبر الجدار الناري). تم تصورها سابقا 

---

#### 2️⃣ ثاني حاجة: الـ API يستلم الطلب

- بس ما يسوي الفحص!
    
- يسجل المهمة كـ Job ويرسلها لطابور المهام.
    
- يرد على المستخدم بـ `202 Accepted` (يعني: "استلمت المهمة وبشتغل عليها، بس مش الآن").
    

ويظهر للمستخدم رسالة: "تم بدء الفحص، ببلغك لما يخلص".

---

#### 3️⃣ ثالثاً: العامل (Worker) يشتغل

- العامل يراقب الطابور، يشوف في مهمة جديدة.
    
- يسحبها ويبدأ الفحص باستخدام أداة مثل `nmap`.
    
- مثلًا:
    

```
nmap -F 192.168.1.10
```


---

#### 4️⃣ رابعاً: يحفظ النتائج

- بعد انتهاء الفحص، النتيجة تكون مثلاً:
    

```
Port 22 SSH مفتوح  
Port 80 HTTP مفتوح  
Port 443 HTTPS مفتوح  
```

- العامل ينظف النتيجة ويحفظها في جدول `scan_results` مع تاريخ الفحص والجهاز.
    

---

#### 5️⃣ وأخيراً: المستخدم يشوف النتائج

- يفتح صفحة "سجل الفحوصات".
    
- نرسل طلب:
    

```
GET /api/v1/devices/{deviceId}/scans
```

- API يرجع له كل النتائج اللي تخص هذا الجهاز.
    

---


