import numpy as np
import random
import time
import itertools

# Dict Structure:
# userid:elo
type UserIdType = str
type MemberDict = dict[UserIdType, int]
type OutputList = tuple[tuple[UserIdType], int]

sample = {"a":120,"b":150,"c":160,"d":150}

def generateTeam(members: MemberDict, stdev: float) -> OutputList:
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
    validArrangements = []
    closestValue = 999999999
    for arr in sortedArrangements:
        # First entry below the sampled threshold will be taken as closest match (not really true but whatever idc)
        elo = arr[1]
        if elo < sample:
            # All matchups with the same elo should also be considered as valid though, we only exit once we go away from the first match
            if elo < closestValue and not len(validArrangements) == 0: break
            validArrangements.append(arr)
            closestValue = elo
    # Returns team arrangement + team elo pair
    # If we didnt find a match for some reason (this shouldnt happen) we just take the closest possible match
    if len(validArrangements) == 0: return sortedArrangements[:-1]
    elif len(validArrangements) == 1: return validArrangements[0]
    # Should we have more than one team with a valid elo, pick one out of those at random
    else: return random.choice(validArrangements)

print(generateTeam(sample, 30))