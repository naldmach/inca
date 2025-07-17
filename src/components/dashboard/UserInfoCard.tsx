type UserInfoCardProps = {
  name: string;
  email: string;
};

export default function UserInfoCard({ name, email }: UserInfoCardProps) {
  return (
    <div className="p-4 bg-white rounded shadow text-center">
      <div className="text-xl font-bold mb-2">{name}</div>
      <div className="text-gray-600">{email}</div>
    </div>
  );
}
