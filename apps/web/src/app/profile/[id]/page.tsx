import { Suspense } from 'react';

// Mock data fetching functions (simulate API calls)
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
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { posts: 42, followers: 1234, following: 567 };
}

async function fetchUserActivity(_id: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [
    { id: 'a1', type: 'post', title: 'My first post' },
    { id: 'a2', type: 'comment', title: 'Great article!' },
  ];
}

// TODO: This fetches SEQUENTIALLY - learner optimizes with Promise.all
// `params` is awaited here rather than in the page body: awaiting it up there
// would block the whole route instead of just this boundary.
async function ProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // INTENTIONAL: Sequential fetching (Section 4 Lesson 2 fixes this)
  const profile = await fetchUserProfile(id);
  const stats = await fetchUserStats(id);
  const activity = await fetchUserActivity(id);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-bold text-2xl">{profile.name}</h1>
        <p className="text-gray-600">{profile.email}</p>
      </section>

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
    </div>
  );
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Suspense
        fallback={<div className="animate-pulse">Loading profile...</div>}
      >
        <ProfileContent params={params} />
      </Suspense>
    </main>
  );
}
