const randomstring = require("randomstring");

const { maintainers } = require("../../Configuration/config.js");

module.exports = async(client, msg, suffix) => {
	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "No arguments were specified.",
			},
		});
	}

	let member, reason;
	if (suffix.indexOf("|") > -1 && suffix.length > 3) {
		member = await client.memberSearch(suffix.substring(0, suffix.indexOf("|")).trim(), msg.guild).catch(() => {
			member = undefined;
		});
		reason = suffix.substring(suffix.indexOf("|") + 1).trim();
	} else {
		reason = "No reason";
		member = await client.memberSearch(suffix, msg.guild).catch(() => {
			member = undefined;
		});
	}

	if (!member) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Could not resolve a member.",
			},
		});
	}

	if (member.user.bot) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "This user cannot be striked.",
			},
		});
	}

	let memberDoc = await Admins.findOne({ where: { serverID: msg.guild.id, id: member.id } });
	if (memberDoc && memberDoc.dataValues.level >= msg.author.adminLevel) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You cannot strike a member with the same or higher admin level than you.",
			},
		});
	}

	await Strikes.create({
		id: randomstring.generate({ length: "8", charset: "alphanumeric" }),
		guild: msg.guild.id,
		offender: member.id,
		creator: msg.author.id,
		reason,
	});
	modLogger.log({
		type: "Strike",
		moderator: {
			id: msg.author.id,
			tag: msg.user.tag,
		},
		user: {
			id: member.id,
			tag: member.tag,
		},
		reason,
	});

	let allUserStrikes = await Strikes.findAll({ where: { guild: msg.guild.id, offender: member.id } });
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: ":white_check_mark: Success!",
			description: `Successfully striked ${member.toString()} with ${reason == "No reason" ? "no reason." : `reason: **${reason}**`}`,
			footer: {
				text: `They now have ${allUserStrikes.length} ${allUserStrikes.length == 1 ? "strike" : "strikes"}.`,
			},
		},
	});
	try {
		member.send({
			embed: {
				color: 0xFF0000,
				title: ":exclamation: Uh oh!",
				description: `You've just been strike in **${msg.guild.name}** with ${reason == "No reason" ? "no reason." : `reason: **${reason}**`}`,
				footer: {
					text: `You now have ${msg.guild.members.size} members.`,
				},
			},
		});
	} catch (_) {
		// Ignore
	}
};

module.exports.info = {
	name: "Strike",
	description: "Regan help me write a description for this",
	pack: "moderation",
	level: 1,
	aliases: [],
};
