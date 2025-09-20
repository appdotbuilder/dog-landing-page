import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heart, Star, PawPrint, Filter, AlertCircle } from 'lucide-react';
import { DogLogoShowcase } from '@/components/DogLogoShowcase';
import type { Dog } from '../../server/src/schema';
import './App.css';

// STUB DATA: This is used when backend is not available
// Remove this when backend handlers are implemented
const STUB_DOGS: Dog[] = [
  {
    id: 1,
    name: "Buddy",
    breed: "Golden Retriever",
    description: "A friendly and energetic golden retriever who loves playing fetch and swimming.",
    logo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    age: 3,
    is_featured: true,
    created_at: new Date('2024-01-15')
  },
  {
    id: 2,
    name: "Luna",
    breed: "Border Collie",
    description: "Intelligent and agile, Luna excels at agility training and herding activities.",
    logo_url: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop",
    age: 2,
    is_featured: false,
    created_at: new Date('2024-02-01')
  },
  {
    id: 3,
    name: "Max",
    breed: "German Shepherd",
    description: "Loyal and protective, Max is a great companion for active families.",
    logo_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
    age: 5,
    is_featured: true,
    created_at: new Date('2024-01-20')
  },
  {
    id: 4,
    name: "Bella",
    breed: "Labrador",
    description: "Sweet and gentle, Bella loves children and is perfect for family activities.",
    logo_url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop",
    age: 4,
    is_featured: false,
    created_at: new Date('2024-01-25')
  },
  {
    id: 5,
    name: "Charlie",
    breed: "Beagle",
    description: "Curious and friendly, Charlie has an amazing sense of smell and loves exploring.",
    logo_url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop",
    age: 3,
    is_featured: true,
    created_at: new Date('2024-02-05')
  },
  {
    id: 6,
    name: "Daisy",
    breed: "Poodle",
    description: "Elegant and smart, Daisy is hypoallergenic and loves learning new tricks.",
    logo_url: "https://images.unsplash.com/photo-1616190267687-b7ebf74cf3d4?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1616190267687-b7ebf74cf3d4?w=400&h=300&fit=crop",
    age: 2,
    is_featured: false,
    created_at: new Date('2024-02-10')
  },
  {
    id: 7,
    name: "Rocky",
    breed: "Bulldog",
    description: "Sturdy and calm, Rocky is a gentle giant who loves relaxing and short walks.",
    logo_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
    age: 6,
    is_featured: false,
    created_at: new Date('2024-01-30')
  },
  {
    id: 8,
    name: "Sophie",
    breed: "Husky",
    description: "Energetic and adventurous, Sophie loves cold weather and long hikes.",
    logo_url: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop&crop=faces",
    photo_url: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop",
    age: 4,
    is_featured: true,
    created_at: new Date('2024-01-28')
  }
];

function App() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [featuredDogs, setFeaturedDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [usingStubData, setUsingStubData] = useState(false);

  // Get unique breeds for filter
  const breeds = [...new Set(dogs.map(dog => dog.breed))];

  const loadDogs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [allDogs, featured] = await Promise.all([
        trpc.getDogs.query(),
        trpc.getFeaturedDogs.query()
      ]);
      
      setDogs(allDogs);
      setFeaturedDogs(featured);
      setFilteredDogs(allDogs);
      setUsingStubData(false);
    } catch (err) {
      console.warn('Backend not available, using stub data for demo:', err);
      // Use stub data when backend is not available
      setDogs(STUB_DOGS);
      setFeaturedDogs(STUB_DOGS.filter(dog => dog.is_featured));
      setFilteredDogs(STUB_DOGS);
      setUsingStubData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDogs();
  }, [loadDogs]);

  useEffect(() => {
    if (selectedBreed === 'all') {
      setFilteredDogs(dogs);
    } else {
      setFilteredDogs(dogs.filter(dog => dog.breed === selectedBreed));
    }
  }, [selectedBreed, dogs]);

  const DogCard = ({ dog, showBadge = false }: { dog: Dog; showBadge?: boolean }) => (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-0">
        {dog.photo_url && (
          <div className="relative overflow-hidden h-64 bg-gradient-to-br from-amber-100 to-orange-100">
            <img
              src={dog.photo_url}
              alt={dog.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {showBadge && dog.is_featured && (
              <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-amber-600" />
              {dog.name}
            </h3>
            {dog.logo_url && (
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-amber-200">
                <img
                  src={dog.logo_url}
                  alt={`${dog.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <Badge variant="secondary" className="mb-3 bg-amber-100 text-amber-800 hover:bg-amber-200">
            {dog.breed}
          </Badge>
          {dog.age && (
            <p className="text-gray-600 text-sm mb-2">🎂 {dog.age} years old</p>
          )}
          {dog.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{dog.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 flex items-center gap-2">
            <PawPrint className="w-4 h-4 animate-bounce" />
            Loading adorable dogs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Demo Notice - Remove when backend is ready */}
      {usingStubData && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4">
          <div className="flex items-center max-w-7xl mx-auto">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
            <p className="text-blue-800">
              <strong>Demo Mode:</strong> Backend handlers not implemented yet. Showing sample data to demonstrate the design.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 via-orange-200/20 to-yellow-200/20"></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-4">
            🐕 Pawsome Dogs
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover amazing dogs from around the world! Each furry friend has their own unique personality and story to tell.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="text-lg py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Heart className="w-4 h-4 mr-2" />
              {dogs.length} Amazing Dogs
            </Badge>
            <Badge className="text-lg py-2 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600">
              <Star className="w-4 h-4 mr-2" />
              {featuredDogs.length} Featured
            </Badge>
          </div>
        </div>
      </section>

      {/* Dog Logos Showcase */}
      <DogLogoShowcase 
        dogs={dogs}
        title="Meet Our Pack"
        description="Quick peek at all our amazing dogs and their unique personalities"
      />

      <Separator className="my-8" />

      {/* Featured Dogs Section */}
      {featuredDogs.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-4 flex items-center justify-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              Featured Dogs
            </h2>
            <p className="text-center text-gray-600 mb-12">Our most special furry friends</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDogs.map((dog: Dog) => (
                <DogCard key={dog.id} dog={dog} showBadge={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Separator className="my-8" />

      {/* All Dogs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <PawPrint className="w-8 h-8 text-amber-600" />
              All Our Dogs
            </h2>
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Filter by breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Breeds 🐕</SelectItem>
                  {breeds.map((breed: string) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredDogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500 mb-4">🔍 No dogs found</p>
              <p className="text-gray-400">Try selecting a different breed filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredDogs.map((dog: Dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-100 to-orange-100 py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for dog lovers everywhere
          </p>
          <p className="text-sm text-gray-500">
            Built with ❤️ by{" "}
            <a href="https://app.build" target="_blank" className="text-amber-600 hover:text-amber-800 font-semibold transition-colors">
              app.build
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;