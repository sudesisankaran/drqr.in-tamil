import React from "react";

type InputFieldProps = {
    label: string;
    type: string;
    placeholder: string;
    icon: React.ReactNode;
    value: string;
    name?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const InputField = ({
    label,
    type,
    placeholder,
    icon,
    value,
    name,
    onChange,
}: InputFieldProps) => {
    return (
        <div>
            <label className="text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="mt-1 flex items-center border rounded-md px-3">
                <span className="text-gray-400">{icon}</span>
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-3 outline-none"
                />
            </div>
        </div>
    );
};

export default InputField;