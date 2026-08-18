import { AuthErrorCode } from "@/schemas/auth.schema";

/**
 * Sanitizes internal and API errors into calm, actionable, non-revealing user messages.
 * Prevents account enumeration while providing clear feedback.
 */
export function mapAuthErrorToMessage(
  code?: AuthErrorCode,
  defaultMsg?: string,
  lang: "en" | "ar" = "en"
): string {
  if (lang === "ar") {
    switch (code) {
      case "INVALID_CREDENTIALS":
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مجدداً.";
      case "RATE_LIMITED":
        return "محاولات تسجيل دخول كثيرة جداً. حرصاً على أمانك، يرجى الانتظار قليلاً قبل المحاولة.";
      case "NETWORK_ERROR":
        return "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.";
      case "SERVER_ERROR":
        return "نواجه مشكلة مؤقتة في الخادم. يرجى المحاولة بعد لحظات.";
      default:
        return defaultMsg || "حدث خطأ غير متوقع. يرجى المحاولة مجدداً.";
    }
  }

  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Incorrect email or password. Please verify your details and try again.";
    case "RATE_LIMITED":
      return "Too many sign-in attempts. For your security, please wait a moment before trying again.";
    case "NETWORK_ERROR":
      return "Unable to connect to the server. Please check your internet connection and try again.";
    case "SERVER_ERROR":
      return "We are experiencing a temporary issue. Please try again in a few moments.";
    default:
      return defaultMsg || "An unexpected error occurred. Please try again.";
  }
}
