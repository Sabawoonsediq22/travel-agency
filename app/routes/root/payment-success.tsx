import {useEffect} from 'react'
import {Link, type LoaderFunctionArgs} from "react-router";
import type { Route } from "./+types/payment-success";
import {Button} from "@/components/ui/button";
import confetti from "canvas-confetti";
import {LEFT_CONFETTI, RIGHT_CONFETTI} from "~/constants";
import {logPaymentSuccess} from "~/lib/sentry";

export async function loader ({ params }: LoaderFunctionArgs) {
    return params;
}

const PaymentSuccess = ({ loaderData }: Route.ComponentProps) => {
    useEffect(() => {
        confetti(LEFT_CONFETTI)
        confetti(RIGHT_CONFETTI)

        if (loaderData?.tripId) {
            logPaymentSuccess(loaderData.tripId, 0);
        }
    }, [])

    return (
        <main className="payment-success wrapper fade-in">
            <section>
                <article>
                    <img src="/assets/icons/check.svg" className="size-24" />
                    <h1>Thank & Welcome Aboard!</h1>

                    <p>Your trip is booked - can't wait to have you on this adventure. Get ready to explore & make memories! ✨</p>
                    
                    <Link to={`/travel/${loaderData?.tripId}`} className="w-full">
                        <Button className="button-class !h-11 !w-full">
                            <img
                                src="/assets/icons/itinerary-button.svg"
                                className="size-5"
                            />

                            <span className="p-16-semibold text-white">View trip details</span>
                        </Button>
                    </Link>
                    <Link to={'/'} className="w-full">
                        <Button variant="secondary" className="button-class-secondary !h-11 !w-full">
                            <img
                                src="/assets/icons/arrow-left.svg"
                                className="size-5"
                            />

                            <span className="p-16-semibold">Return to homepage</span>
                        </Button>
                    </Link>
                </article>
            </section>
        </main>
    )
}
export default PaymentSuccess
