/**
 * User-facing Arabic messages for Firebase error codes.
 */
const firebase = {
  "auth/wrong-password": "كلمة المرور التي أدخلتها غير صحيحة. يُرجى المحاولة مرة أخرى.",
  "auth/invalid-credential": "بيانات الاعتماد غير مطابقة لسجلاتنا.",
  "auth/invalid-email": "يرجى إدخال بريد إلكتروني صالح.",
  "auth/user-not-found": "لا يوجد حساب مطابق لهذا البريد الإلكتروني.",
  "auth/missing-password": "يُرجى إدخال كلمة المرور.",
  "auth/email-already-in-use": "هذا البريد الإلكتروني مسجّل بالفعل.",
  "auth/requires-recent-login": "يُرجى تسجيل الدخول مجددًا للمتابعة.",
  "auth/session-expired": "انتهت جلستك. يُرجى تسجيل الدخول مجددًا.",
  "auth/invalid-verification-code": "رمز التحقق غير صالح.",
  "auth/invalid-verification-id": "رابط التحقق غير صالح أو منتهي الصلاحية.",
  "auth/account-exists-with-different-credential":
    "يوجد حساب بهذا البريد الإلكتروني مُسجَّل بطريقة دخول مختلفة.",
  "auth/weak-password": "يُرجى اختيار كلمة مرور أقوى (8 أحرف على الأقل).",
  "auth/too-many-requests": "محاولات كثيرة جدًا. يُرجى الانتظار قليلًا ثم إعادة المحاولة.",
  "auth/user-disabled": "تم تعطيل هذا الحساب. تواصل مع الدعم للمساعدة.",
  "auth/operation-not-allowed": "طريقة تسجيل الدخول هذه غير مفعّلة.",
  "auth/admin-restricted-operation": "هذه العملية متاحة للمسؤولين فقط.",
  "auth/unauthorized-domain": "هذا النطاق غير مسموح له بتسجيل الدخول.",
  "auth/network-request-failed": "مشكلة في الشبكة. تحقق من اتصالك وحاول مجددًا.",
  "auth/timeout": "انتهت مهلة الطلب. يُرجى المحاولة مجددًا.",
  "auth/internal-error": "حدث خطأ داخلي. يُرجى المحاولة مرة أخرى بعد قليل.",
  "auth/captcha-check-failed": "فشل التحقق الأمني. يُرجى المحاولة مجددًا.",
  "auth/invalid-app-credential": "تسجيل الدخول بالهاتف غير مُعد بشكل صحيح. تواصل مع الدعم.",
  "storage/unauthenticated": "يُرجى تسجيل الدخول للمتابعة.",
  "storage/unauthorized": "ليست لديك الصلاحية للوصول إلى هذا الملف.",
  "storage/retry-limit-exceeded": "فشل الرفع بعد عدة محاولات. يُرجى المحاولة مجددًا.",
  "storage/canceled": "تم إلغاء عملية الرفع.",
  "storage/object-not-found": "تعذر العثور على الملف المطلوب.",
  "storage/unknown": "حدث خطأ أثناء الوصول إلى التخزين. يُرجى التحقق من الاتصال والمحاولة مجددًا.",
  "firestore/permission-denied": "ليست لديك الصلاحية لتنفيذ هذا الإجراء.",
  "firestore/failed-precondition":
    "تعذر تحميل المحادثة بسبب نقص فهرس أو قاعدة في Firestore. راجع وحدة التحكم في المتصفح للتفاصيل.",
  "firestore/not-found": "تعذر العثور على قاعدة بيانات أو مجموعة Firestore.",
  "firestore/cancelled": "تم إلغاء طلب المحادثة.",
  "firestore/unavailable": "الخدمة غير متاحة مؤقتًا. يُرجى المحاولة لاحقًا.",
  "firestore/deadline-exceeded": "استغرق الطلب وقتًا طويلًا. يُرجى المحاولة مجددًا.",
  "functions/deadline-exceeded": "استغرق الطلب وقتًا طويلًا. يُرجى المحاولة مجددًا.",
  "functions/unavailable": "الخدمة غير متاحة مؤقتًا. يُرجى المحاولة لاحقًا.",
  default: "حدث خطأ ما. يُرجى المحاولة مجددًا.",
} as const;

export default firebase;
