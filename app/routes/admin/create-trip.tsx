import Header from "../../../components/Header";
import type { Route } from './+types/create-trip'
import {comboBoxItems, selectItems} from "~/constants";
import {cn, formatKey} from "~/lib/utils";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {getAccount} from "~/appwrite/client";
import {useNavigate} from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Sentry from "@sentry/react-router";

export const loader = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();

    return data.map((country: any) => ({
        name: country.flag + country.name.common,
        coordinates: country.latlng,
        value: country.name.common,
        openStreetMap: country.maps?.openStreetMap,
    }))
}

const CreateTrip = ({ loaderData }: Route.ComponentProps ) => {
    const countries = loaderData as Country[];
    const navigate = useNavigate();

    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || '',
        travelStyle: '',
        interest: '',
        budget: '',
        duration: 0,
        groupType: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
       e.preventDefault()
        setLoading(true);

       if(
           !formData.country ||
           !formData.travelStyle ||
           !formData.interest ||
           !formData.budget ||
           !formData.groupType
       ) {
           setError('Please provide values for all fields');
           setLoading(false)
           return;
       }

       if(formData.duration < 1 || formData.duration > 10) {
           setError('Duration must be between 1 and 10 days');
           setLoading(false)
           return;
       }
        const user = await getAccount().get();
        if(!user.$id) {
            console.error('User not authenticated');
            setLoading(false)
            return;
        }

       try {
           const response = await fetch('/api/create-trip', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json'},
               body: JSON.stringify({
                   country: formData.country,
                   numberOfDays: formData.duration,
                   travelStyle: formData.travelStyle,
                   interests: formData.interest,
                   budget: formData.budget,
                   groupType: formData.groupType,
                   userId: user.$id
               })
           })

           const result: CreateTripResponse = await response.json();

           if(result?.id) navigate(`/trips/${result.id}`)
           else console.error('Failed to generate a trip')
       } catch (e) {
           Sentry.captureException(e as Error, {
               tags: { location: "create-trip-client", country: formData.country, travelStyle: formData.travelStyle },
               extra: { duration: formData.duration, budget: formData.budget },
           });
           console.error('Error generating trip', e);
       } finally {
           setLoading(false)
       }
    };

    const handleChange = (key: keyof TripFormData, value: string | number)  => {
    setFormData({ ...formData, [key]: value})
    }

    return (
        <main className="flex flex-col gap-10 pb-20 wrapper">
            <Header title="Add a New Trip" description="View and edit AI Generated travel plans" />

            <section className="mt-2.5 wrapper-md">
                <form className="trip-form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="country">
                            Country
                        </label>
                        <Select value={formData.country as string} onValueChange={(value: string | null) => handleChange('country', value ?? '')}>
                            <SelectTrigger id="country" className="combo-box">
                                <SelectValue placeholder="Select a Country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((country) => (
                                    <SelectItem key={country.value} value={country.value}>
                                        {country.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="duration">Duration</label>
                        <input
                            id="duration"
                            name="duration"
                            type="number"
                            placeholder="Enter a number of days"
                            className="form-input placeholder:text-gray-100"
                            onChange={(e) => handleChange('duration', Number(e.target.value))}
                        />
                    </div>

                    {selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>{formatKey(key)}</label>

                            <Select value={formData[key] as string | null | undefined} onValueChange={(value: string | null) => handleChange(key, value ?? '')}>
                                <SelectTrigger id={key} className="combo-box">
                                    <SelectValue placeholder={`Select ${formatKey(key)}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {comboBoxItems[key].map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}

                    <div>
                        <label htmlFor="location">
                            Location on the world map
                        </label>
                        <div className="combo-box p-3.5 rounded-xl border border-light-400 text-base text-dark-300 font-normal">
                            {formData.country || 'Select a country to see location'}
                        </div>
                    </div>

                    <div className="bg-gray-200 h-px w-full" />

                    {error && (
                        <div className="error">
                            <p>{error}</p>
                        </div>
                    )}
                    <footer className="px-6 w-full">
                        <Button type="submit"
                            className="button-class !h-12 !w-full" disabled={loading}
                        >
                            <img src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`} className={cn("size-5", {'animate-spin': loading})} />
                            <span className="p-16-semibold text-white">
                                {loading ? 'Generating...' : 'Generate Trip'}
                            </span>
                        </Button>
                    </footer>
                </form>
            </section>
        </main>
    )
}
export default CreateTrip
