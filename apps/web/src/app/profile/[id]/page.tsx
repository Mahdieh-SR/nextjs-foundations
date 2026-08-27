import { Suspense } from 'react';

type Params = Promise<{ id: string }>;

// Mock data fetching functions (simulate API calls). The three take visibly
// different times so the streaming order is observable.
async function fetchUserProfile(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    id,
    name: 'Demo User',
    email: 'demo@example.com',
    joinedAt: new Date('2024-01-15'),
  };
}

async function fetchUserStats(_id: string) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { posts: 42, followers: 1234, following: 567 };
}

async function fetchUserActivity(_id: string) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    { id: 'a1', type: 'post', title: 'My first post' },
    { id: 'a2', type: 'comment', title: 'Great article!' },
    { id: 'a3', type: 'post', title: 'Notes on streaming' },
  ];
}

/* -------------------------------------------------------------------------- */
/* Sections. Each one awaits `params` itself and fetches only what it renders,  */
/* so the three requests run at the same time instead of in a chain, and each   */
/* boundary can resolve the moment its own data lands.                          */
/* -------------------------------------------------------------------------- */

async function ProfileHeader({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await fetchUserProfile(id);

  return (
    <section>
      <h1 className="font-bold text-2xl">{profile.name}</h1>
      <p className="text-gray-600">{profile.email}</p>
    </section>
  );
}

async function ProfileStats({ params }: { params: Params }) {
  const { id } = await params;
  const stats = await fetchUserStats(id);

  return (
    <section className="flex gap-4">
      <div>
        <strong>{stats.posts}</strong> posts
      </div>
      <div>
        <strong>{stats.followers}</strong> followers
      </div>
      <div>
        <strong>{stats.following}</strong> following
      </div>
    </section>
  );
}

async function ProfileActivity({ params }: { params: Params }) {
  const { id } = await params;
  const activity = await fetchUserActivity(id);

  return (
    <section>
      <h2 className="mb-2 font-semibold text-xl">Recent Activity</h2>
      <ul className="space-y-2">
        {activity.map((item) => (
          <li className="text-gray-700" key={item.id}>
            {item.title}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Fallbacks. Each one occupies the same space as the section it stands in for, */
/* so nothing jumps when the real content replaces it.                          */
/* -------------------------------------------------------------------------- */

function HeaderSkeleton() {
  return (
    <section className="animate-pulse">
      {/* h-8 matches text-2xl, h-4 the paragraph below it */}
      <div className="mb-2 h-8 w-48 rounded bg-gray-200" />
      <div className="h-4 w-32 rounded bg-gray-200" />
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className="flex animate-pulse gap-4">
      <div className="h-6 w-20 rounded bg-gray-200" />
      <div className="h-6 w-24 rounded bg-gray-200" />
      <div className="h-6 w-24 rounded bg-gray-200" />
    </section>
  );
}

function ActivitySkeleton() {
  return (
    <section className="animate-pulse">
      <div className="mb-2 h-6 w-40 rounded bg-gray-200" />
      <div className="space-y-2">
        {/* One bar per row the list will render */}
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>
    </section>
  );
}

/**
 * Three boundaries, not one per element: the sections load at different speeds
 * and are visually distinct, which is exactly when a boundary earns its place.
 * The header is first so the part above the fold settles first.
 */
export default function ProfilePage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Suspense fallback={<HeaderSkeleton />}>
        <ProfileHeader params={params} />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <ProfileStats params={params} />
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <ProfileActivity params={params} />
      </Suspense>
    </main>
  );
}
