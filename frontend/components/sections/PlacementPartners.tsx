"use client"

const placementPartners = {
    tier1: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'ISRO', 'Honda', 'HP', 'CISCO'],
    tier2: ['Deloitte', 'Accenture', 'TCS', 'Infosys', 'Wipro', 'HCL', 'IndiGo', 'VMware', 'Genpact'],
    tier3: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'HSBC', 'Apollo', 'NOVA Fertility', 'LTI'],
    tier4: ['Flipkart', 'Swiggy', 'Zomato', 'QUESS', 'Digitide', 'Outworx', 'Infinite', 'AMI', 'Juniper'],
}

export function PlacementPartners() {
    // Extra partners with ratings requested by user
    interface Partner {
        name: string
        rating: string | null
        color?: string
    }

    const ratedPartners: Partner[] = [
        { name: "Just Dial", rating: "4.8/5", color: "text-orange-500" },
        { name: "Google My Business", rating: "4.8/5", color: "text-blue-500" },
    ];

    // Combine all partners into a single list for the marquee
    // We intertwine rated partners to ensure they appear frequently or at start
    const allPartners: Partner[] = [
        ...ratedPartners,
        ...placementPartners.tier1.map(p => ({ name: p, rating: null })),
        ...placementPartners.tier2.map(p => ({ name: p, rating: null })),
        ...placementPartners.tier3.map(p => ({ name: p, rating: null })),
        ...placementPartners.tier4.map(p => ({ name: p, rating: null })),
    ];

    // Duplicate list for seamless loop
    const marqueePartners = [...allPartners, ...allPartners];

    return (
        <div className="relative border-y bg-background/50 backdrop-blur-sm overflow-hidden py-10">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-8">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                        Trusted by 500+ Leading Organizations
                    </p>
                </div>

                <div className="relative flex overflow-hidden group">
                    <div className="flex animate-marquee whitespace-nowrap gap-12 hover:[animation-play-state:paused] items-center">
                        {marqueePartners.map((company, i) => (
                            <div
                                key={`${company.name}-${i}`}
                                className="relative flex flex-col items-center justify-center min-w-[150px] grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer group/item"
                            >
                                {/* Rating Badge if available */}
                                {company.rating && (
                                    <div className="absolute -top-6 bg-white dark:bg-zinc-800 shadow-md border px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 scale-90 opacity-0 group-hover/item:opacity-100 group-hover/item:scale-100 transition-all z-10">
                                        <span className="text-yellow-500">★</span>
                                        {company.rating}
                                    </div>
                                )}

                                {/* Since we don't have SVGs, we use stylized text to represent logos */}
                                <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 hover:from-primary hover:to-purple-600 transition-all ${company.color ? company.color : ''}`}>
                                    {company.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Gradient Masks */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent"></div>
                </div>
            </div>

        </div>
    )
}
