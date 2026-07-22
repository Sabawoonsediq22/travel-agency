import * as Sentry from "@sentry/react-router";

export const setSentryUser = (user: { $id: string; email: string; name?: string }) => {
    Sentry.setUser({
        id: user.$id,
        email: user.email,
        name: user.name,
    });
};

export const clearSentryUser = () => {
    Sentry.setUser(null);
};

export const captureTripError = (error: unknown, context: Record<string, unknown>) => {
    Sentry.withScope((scope) => {
        scope.setTag("location", "create-trip");
        scope.setExtra("context", context);
        Sentry.captureException(error as Error);
    });
};

export const capturePaymentError = (error: unknown, tripId?: string) => {
    Sentry.withScope((scope) => {
        scope.setTag("location", "payment");
        if (tripId) scope.setTag("tripId", tripId);
        Sentry.captureException(error as Error);
    });
};

export const logPaymentSuccess = (tripId: string, amount: number) => {
    Sentry.withScope((scope) => {
        scope.setTag("location", "payment-success");
        scope.setTag("tripId", tripId);
        scope.setExtra("amount", amount);
        Sentry.captureMessage("Payment successful", "info");
    });
};
