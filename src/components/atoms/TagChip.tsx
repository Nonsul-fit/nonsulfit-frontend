interface TagChipProps {
  text: string;
}

const TagChip = ({ text }: TagChipProps) => {
  let colorClass = "bg-gray-100 text-gray-600 border-gray-200";

  if (text.includes("상향")) {
    colorClass = "bg-red-100 text-red-700 border-red-200/90";
  } else if (text.includes("적정")) {
    colorClass = "bg-amber-100 text-amber-700 border-amber-200/70";
  } else if (text.includes("하향")) {
    colorClass = "bg-teal-100 text-teal-800 border-teal-200/70";
  }

  return (
    <span
      className={`text-[12px] font-bold px-2.5 py-0.5 rounded-md border tracking-tight ${colorClass}`}
    >
      {text}
    </span>
  );
};

export default TagChip;
