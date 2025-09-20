import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, Star } from 'lucide-react';
import type { Dog } from '../../../server/src/schema';

interface DogLogoShowcaseProps {
  dogs: Dog[];
  title: string;
  description?: string;
  showOnlyWithLogos?: boolean;
}

export function DogLogoShowcase({ 
  dogs, 
  title, 
  description,
  showOnlyWithLogos = false 
}: DogLogoShowcaseProps) {
  const displayDogs = showOnlyWithLogos 
    ? dogs.filter(dog => dog.logo_url) 
    : dogs;

  if (displayDogs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <PawPrint className="w-8 h-8 text-amber-600" />
            {title}
          </h2>
          {description && (
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {displayDogs.map((dog: Dog) => (
            <Card 
              key={dog.id} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg aspect-square"
            >
              <CardContent className="p-4 h-full flex flex-col items-center justify-center">
                {dog.logo_url ? (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-amber-200 group-hover:ring-amber-400 transition-all duration-300 mb-3">
                      <img
                        src={dog.logo_url}
                        alt={`${dog.name} logo`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    {dog.is_featured && (
                      <div className="absolute -top-1 -right-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center mb-3 group-hover:from-amber-300 group-hover:to-orange-300 transition-all duration-300">
                    <PawPrint className="w-8 h-8 text-amber-700" />
                  </div>
                )}
                
                <h3 className="font-semibold text-gray-800 text-center text-sm mb-1 group-hover:text-amber-700 transition-colors">
                  {dog.name}
                </h3>
                
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-amber-100 text-amber-700 group-hover:bg-amber-200 transition-colors"
                >
                  {dog.breed}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}