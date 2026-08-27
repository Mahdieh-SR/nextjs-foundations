import Image from 'next/image';

const HERO = {
  src: 'https://picsum.photos/seed/gallery-hero/1600/900',
  alt: 'Featured landscape',
};

const images = [
  {
    id: 'mountain',
    src: 'https://picsum.photos/seed/mountain/800/600',
    alt: 'Mountain landscape',
  },
  {
    id: 'ocean',
    src: 'https://picsum.photos/seed/ocean/800/600',
    alt: 'Ocean sunset',
  },
  {
    id: 'forest',
    src: 'https://picsum.photos/seed/forest/800/600',
    alt: 'Forest path',
  },
  {
    id: 'city',
    src: 'https://picsum.photos/seed/city/800/600',
    alt: 'City skyline',
  },
];

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 font-bold text-3xl">Photo Gallery</h1>

      {/*
        The hero is the LCP candidate, so it is preloaded rather than lazy
        loaded. The wrapper fixes the aspect ratio, which is what reserves the
        space `fill` needs — `fill` on its own would collapse to nothing.

        `sizes` describes the rendered width, not the file. max-w-4xl is 896px
        and p-8 takes 32px from each side, so the hero renders at 832px once the
        viewport is wide enough, and fills the padded viewport below that.
      */}
      <div className="relative mb-8 aspect-video w-full">
        <Image
          alt={HERO.alt}
          className="rounded-lg object-cover"
          fill
          preload
          quality={85}
          sizes="(min-width: 896px) 832px, calc(100vw - 4rem)"
          src={HERO.src}
        />
      </div>

      {/*
        Below the fold, so these stay lazy: the browser fetches them as they
        approach the viewport.

        Two columns with a 1rem gap inside the 832px content box means 408px
        each. Rounding that up would cost real bytes: at DPR 2 the browser asks
        for 816px and picks the 828w file, where a claimed 440px would send it
        to 1080w for the same pixels on screen.
      */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image) => (
          <div className="relative aspect-[4/3]" key={image.id}>
            <Image
              alt={image.alt}
              className="rounded-lg object-cover"
              fill
              quality={80}
              sizes="(min-width: 896px) 408px, calc((100vw - 5rem) / 2)"
              src={image.src}
            />
          </div>
        ))}
      </div>

      <section className="mt-8 rounded bg-gray-100 p-4">
        <h2 className="mb-2 font-semibold">What next/image does here</h2>
        <ul className="list-inside list-disc text-gray-600 text-sm">
          <li>Serves AVIF or WebP, falling back to the original format</li>
          <li>Lazy loads the grid; preloads only the hero</li>
          <li>Picks a width from `sizes` instead of shipping the full file</li>
          <li>Reserves space through the aspect-ratio wrapper, so no shift</li>
        </ul>
      </section>
    </main>
  );
}
