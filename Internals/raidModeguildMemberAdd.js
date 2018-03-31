module.exports = async(client, member, doc) => {
	let admins = await Admins.findAll({ where: { serverID: member.guild.id } });
	for (let i of admins) {
		try {
			client.users.get(i.dataValues.userID).send({
				color: 0xFF0000,
				title: ":exclamation: Raid Mode",
				description: `**${member.user.name}** has just joined **${member.guild.name}**`,
				footer: {
					text: require("../package.json").version,
				},
			});
		} catch (_) {
			// Ignore
		}
	}
};
