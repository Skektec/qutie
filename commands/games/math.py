import numpy as np
import random, time, itertools, ast, sys

# Credit to kAerospace for the team math

# Dict Structure:
# userid:elo
type UserIdType = str
type MemberDict = dict[UserIdType, int]
type OutputType = tuple[tuple[UserIdType]] | None # Should return a 2-long tuple containing tuples with the team composition

def generateTeam(members: MemberDict, stdev: float = 1) -> OutputType:
    if len(members) < 2 or stdev < 0: return None
    eloSum = sum(members.values())
    lowestDifference = 999999999
    # Calculate permutations for one team (other team elo will be diff to eloSum)
    permutations: dict[list[UserIdType], int] = {} # Key -> Team arrangement, Value: Elo Difference
    for permutation in itertools.permutations(members, int(len(members)/2)):
        # Calculate elo difference to other team, which has elo of eloSum - elo of this permutation
        eloDifference = np.abs(eloSum - 2 * sum(members[uid] for uid in permutation))
        if (eloDifference < lowestDifference): lowestDifference = eloDifference
        permutations[permutation] = eloDifference
    np.random.RandomState(int(time.time()))
    sample = lowestDifference + np.abs(np.random.normal(0, stdev))
    sortedArrangements = list(reversed(sorted(permutations.items(), key = lambda item: item[1]))) # Sort entries by elo difference, descending order
    validArrangements: list[list[UserIdType]] = []
    closestValue = 999999999
    for arr in sortedArrangements:
        # First entry below the sampled threshold will be taken as closest match (not really true but whatever idc)
        elo = arr[1]
        if elo < sample:
            # All matchups with the same elo should also be considered as valid though, we only exit once we go away from the first match
            if elo < closestValue and not len(validArrangements) == 0: break
            validArrangements.append(arr[0])
            closestValue = elo
    # Returns team arrangement
    # If we didnt find a match for some reason (this shouldnt happen) we just take the closest possible match
    teamArrangement = sortedArrangements[-1][0] if len(validArrangements) == 0 else random.choice(validArrangements)
    otherTeam = tuple(set(members.keys()) - set(teamArrangement))
    return (teamArrangement, otherTeam)

members = ast.literal_eval(sys.argv[1])
stdev   = int(ast.literal_eval(sys.argv[2]))

print(generateTeam(members, stdev))