const readline = require("readline")

process.removeAllListeners("warning")

/**
 * @param {number} userId
 * @returns {Array<number>}
 * 
 * @description Returns a list of friends for the given user id.
 */
async function getFriends(userId) {
    const response = await fetch(`https://friends.roblox.com/v1/users/${userId}/friends`)

    if (response.ok) {
        const json = await response.json()
        const userIds = json.data.map(data => data.id)

        return userIds
    } else {
        const json = await response.json()
        const errorMessage = json.errors[0].message

        throw new Error(`Error: ${errorMessage}`)
    }
}

/**
 * @param {number} userId
 * @returns {Array<number>}
 * 
 * @description Returns the roblox badges owned by the given user id.
 */
async function getRobloxBadges(userId) {
    const response = await fetch(`https://accountinformation.roblox.com/v1/users/${userId}/roblox-badges`)

    if (response.ok) {
        const json = await response.json()

        return json
    } else {
        const json = await response.json()
        const errorMessage = json.errors[0].message

        throw new Error(`Error: ${errorMessage}`)
    }
}

/**
 * @param {number} userId
 * @returns {boolean}
 * 
 * @description Returns wheather or not the given user id has admin.
 */
async function isAdmin(userId) {
    const badges = await getRobloxBadges(userId)
    const hasAdminBadge = badges.some(badgeData => badgeData.id === 1)

    return hasAdminBadge
}

/**
 * @param {number} userId
 * @returns {Array<number> | false}
 * 
 * @description Returns a list of friends who have the admin badge for the given user id.
 */
async function getAdminFriends(userId) {
    const friends = await getFriends(userId)
    let adminFriends = []

    for (const friendUserId of friends) {
        if (await isAdmin(friendUserId)) {
            adminFriends.push(friendUserId)
        }
    }

    return adminFriends
}

function app() {
    const interface = readline.createInterface({ input: process.stdin, output: process.stdout })

    console.log("Enter a user id.")

    interface.on("line", async rawUserId => {
        const userId = Number(rawUserId)

        if (userId) {
            console.info("Checking....")

            const adminFriends = await getAdminFriends(userId)

            if (adminFriends.length > 0) {
                console.info(JSON.stringify(adminFriends))
            } else {
                console.info("User is not friends with any admins.")
            }

            console.info("Done.")
        } else {
            console.error("Input given was not a number.")
        }

        console.log("Enter a user id.")
    })
}

app()