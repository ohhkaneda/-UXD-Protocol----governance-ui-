type VoteResultsBarProps = {
  approveVotePercentage: number
  denyVotePercentage: number
}

const VoteResultsBar = ({
  approveVotePercentage = 0,
  denyVotePercentage = 0,
}: VoteResultsBarProps) => {
  return (
    <>
      <div className="bg-bkg-4 h-2 flex flex-grow mt-2.5 w-full">
        <div
          style={{
            width: `${
              approveVotePercentage > 2 || approveVotePercentage < 0.01
                ? approveVotePercentage
                : 2
            }%`,
          }}
          className={`bg-green flex`}
        ></div>
        <div
          style={{
            width: `${
              denyVotePercentage > 2 || denyVotePercentage < 0.01
                ? denyVotePercentage
                : 2
            }%`,
          }}
          className={`bg-red flex`}
        ></div>
      </div>
    </>
  )
}

export default VoteResultsBar
