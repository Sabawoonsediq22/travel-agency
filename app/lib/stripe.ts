import Stripe from 'stripe';

let stripe: Stripe | null = null;

function getStripe(): Stripe {
    if (stripe) return stripe;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        throw new Error('Missing required environment variable: STRIPE_SECRET_KEY');
    }

    stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-08-27.basil'
    });

    return stripe;
}

export const createProduct = async (
    name: string, description: string, images: string[], price:number, tripId: string
) => {
    const stripeInstance = getStripe();
    const product = await stripeInstance.products.create({
        name,
        description,
        images
    });

    const priceObject = await stripeInstance.prices.create({
        product: product.id,
        unit_amount: price * 100,
        currency: 'usd'
    })

    const paymentLink = await stripeInstance.paymentLinks.create({
        line_items: [{ price: priceObject.id, quantity: 1}],
        metadata: { tripId },
        after_completion: {
            type: 'redirect',
            redirect: {
                url: `${process.env.VITE_BASE_URL}/travel/${tripId}/success`
            }
        }
    })

    return paymentLink;
}