export enum Flag {
  Danger,
  Warning,
  OK,
}

type OptionText = {
  text: string;
  flag?: Flag;
};

type OptionDetails = {
  [label: string]: OptionText;
};

const setFlagColorText = (flag?: Flag) => {
  switch (flag) {
    case Flag.Danger:
      return 'text-red';
    case Flag.Warning:
      return 'text-orange';
    case Flag.OK:
      return 'text-green';
    default:
      return '';
  }
};

const SelectOptionDetailed = ({
  title,
  details,
  diffValue,
}: {
  title: string;
  details: OptionDetails;
  diffValue?: OptionText;
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-0.5">{title}</div>

      <div className="flex flex-col">
        {Object.entries(details).map(([label, option]) => (
          <div
            key={option.text}
            className={`space-y-0.5 text-xs text-fgd-3 ${setFlagColorText(
              option.flag,
            )}`}
          >
            {`${label}: ${option.text}`}
          </div>
        ))}
        {diffValue && (
          <div className="mt-0.5">
            <span className={`text-xs ${setFlagColorText(diffValue.flag)}`}>
              {diffValue.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectOptionDetailed;
