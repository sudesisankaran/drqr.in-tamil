type ProfileFieldProps = {
  label: string;
  value?: string | number;
  onEdit: () => void;
};

const ProfileField = ({ label, value, onEdit }: ProfileFieldProps) => {
  return (
    <div className="flex justify-between items-center border-b py-2">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-800">
          {value || <span className="text-gray-400">Not added</span>}
        </p>
      </div>

      <button
        onClick={onEdit}
        className="text-blue-600 text-sm font-medium hover:underline"
      >
        {value ? "Edit" : "Add"}
      </button>
    </div>
  );
};

export default ProfileField;