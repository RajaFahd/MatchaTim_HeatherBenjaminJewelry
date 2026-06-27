'use client'

const products = [
  { name: "Luna Crescent Necklace", description: "Delicate sterling silver crescent moon necklace handcrafted for everyday celestial elegance", material: "Sterling Silver", image: "HB001.jpg", price: "85.00" },
  { name: "Aurora Ring", description: "Gold vermeil ring featuring a graceful wave silhouette inspired by northern lights", material: "Gold Vermeil", image: "HB002.jpg", price: "95.00" },
  { name: "Forest Bracelet", description: "Brass bracelet with hand-stamped leaf motifs evoking a walk through ancient woodland", material: "Brass", image: "HB003.jpg", price: "65.00" },
  { name: "Celestial Pendant", description: "Moonstone pendant set in sterling silver capturing ethereal light with every movement", material: "Moonstone", image: "HB004.jpg", price: "110.00" },
  { name: "Terra Earrings", description: "Hammered bronze drop earrings with organic texture inspired by ancient earth elements", material: "Bronze", image: "HB005.jpg", price: "72.00" },
  { name: "Soleil Anklet", description: "Dainty sterling silver anklet with tiny sun charms for effortless beachside elegance", material: "Sterling Silver", image: "HB006.jpg", price: "55.00" },
  { name: "Bloom Brooch", description: "Gold vermeil brooch shaped as a blooming flower with hand-set petal details", material: "Gold Vermeil", image: "HB007.jpg", price: "130.00" },
  { name: "Harmony Jewelry Set", description: "Brushed sterling silver set including necklace earrings and bracelet in unified floral design", material: "Sterling Silver", image: "HB008.jpg", price: "210.00" },
  { name: "Ocean Pendant", description: "Turquoise pendant framed in oxidized brass evoking calm open ocean horizons", material: "Turquoise", image: "HB009.jpg", price: "98.00" },
  { name: "Golden Horizon Necklace", description: "Layered gold vermeil necklace with geometric bar links inspired by warm sunset horizons", material: "Gold Vermeil", image: "HB010.jpg", price: "145.00" },
  { name: "Midnight Onyx Ring", description: "Bold sterling silver ring featuring a smooth oval onyx stone for confident elegance", material: "Onyx", image: "HB011.jpg", price: "105.00" },
  { name: "Ember Garnet Bracelet", description: "Sterling silver bracelet with hand-set garnet stones radiating warmth and timeless beauty", material: "Garnet", image: "HB012.jpg", price: "120.00" },
  { name: "Mist Labradorite Earrings", description: "Labradorite drop earrings in brushed silver capturing shifting iridescent spectral light", material: "Labradorite", image: "HB013.jpg", price: "115.00" },
  { name: "Violet Amethyst Pendant", description: "Faceted amethyst pendant set in sterling silver radiating calm violet elegance", material: "Amethyst", image: "HB014.jpg", price: "125.00" },
  { name: "Pearl Serenity Necklace", description: "Hand-knotted freshwater pearl necklace finished with a sterling silver lobster clasp", material: "Pearl", image: "HB015.jpg", price: "160.00" },
  { name: "Quartz Clarity Ring", description: "Clear quartz cabochon ring in sterling silver symbolizing clarity focus and inner light", material: "Quartz", image: "HB016.jpg", price: "88.00" },
  { name: "Sahara Cuff Bracelet", description: "Wide hammered brass cuff bracelet with hand-etched geometric desert-inspired patterns", material: "Brass", image: "HB017.jpg", price: "78.00" },
  { name: "Moonrise Anklet", description: "Gold vermeil anklet with delicate moonstone bead accents for refined bohemian style", material: "Gold Vermeil", image: "HB018.jpg", price: "68.00" },
  { name: "Twilight Brooch", description: "Oxidized sterling silver brooch shaped as a crescent with hand-set moonstone center", material: "Sterling Silver", image: "HB019.jpg", price: "140.00" },
  { name: "Celestial Dusk Jewelry Set", description: "Gold vermeil jewelry set featuring matching earrings necklace and ring with star motifs", material: "Gold Vermeil", image: "HB020.jpg", price: "245.00" },
]

export default function CatalogPage() {
  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-serif tracking-widest uppercase text-[#1A1A1A]">
          Product Catalog
        </h1>
        <p className="text-[#9B8B7A] mt-2 text-sm tracking-wide">
          {products.length} pieces — Handcrafted in Bali
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#E8DDD0] hover:shadow-md transition group">
            <div className="aspect-square bg-[#F5F0E8] overflow-hidden">
              <img
                src={`/images/${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/F5F0E8/9B8B7A?text=HBJ'
                }}
              />
            </div>
            <div className="p-4">
              <p className="font-serif text-sm text-[#1A1A1A] leading-tight">{product.name}</p>
              <p className="text-xs text-[#9B8B7A] mt-1">{product.material}</p>
              <p className="text-xs text-[#9B8B7A] mt-1 line-clamp-2">{product.description}</p>
              <p className="text-sm font-semibold text-[#1A1A1A] mt-3">${product.price} USD</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
