import {Link} from "react-router";
import {Button} from "@/components/ui/button";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    ctaText?: string;
    ctaUrl?: string;
}

const EmptyState = ({ title, description, icon = '/assets/icons/destination.svg', ctaText, ctaUrl }: EmptyStateProps) => {
    return (
        <div className="empty-state fade-in">
            <img src={icon} alt={title} />
            <h3>{title}</h3>
            <p>{description}</p>
            {ctaText && ctaUrl && (
                <Link to={ctaUrl}>
                    <Button className="button-class !h-10 !px-5">
                        <span className="p-16-semibold text-white">{ctaText}</span>
                    </Button>
                </Link>
            )}
        </div>
    )
}
export default EmptyState
