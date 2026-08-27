'use client';

type UserDTO = {
  id: string;
  name: string;
  createdAt: string;
};

export function UserCard({ user }: { user: UserDTO }) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <h2 className="font-semibold">{user.name}</h2>
      <p className="text-gray-500 text-sm">ID: {user.id}</p>
      <p className="text-gray-500 text-sm">
        Joined: {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
