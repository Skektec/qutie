// I was planning on making embeds quotable but it wasn't nessary

if (reaction.message.embeds.length > 0) {
	const isoTimestamp = reaction.message.embeds[0].data.timestamp;
	const time = Math.floor(new Date(isoTimestamp).getTime());

	try {
		const embedEmbed = new EmbedBuilder()
			.setColor(reaction.message.embeds[0].data.color)
			.setTitle(reaction.message.embeds[0].data.title || null)
			.setURL(reaction.message.embeds[0].data.url)
			.setAuthor({
				name: reaction.message.embeds[0].data.author
					? reaction.message.embeds[0].data.author.name
					: null,
				iconURL: reaction.message.embeds[0].data.icon_url,
				url: reaction.message.embeds[0].data.author
					? reaction.message.embeds[0].data.author.url
					: null,
			})
			.setDescription(reaction.message.embeds[0].data.description)
			.setImage(
				reaction.message.embeds[0].data.image
					? reaction.message.embeds[0].data.image.url
					: null
			)
			.setTimestamp(time)
			.setFooter({
				text: reaction.message.embeds[0].data.footer
					? reaction.message.embeds[0].data.footer.text
					: null,

				iconURL: reaction.message.embeds[0].data.footer
					? reaction.message.embeds[0].data.footer.icon_url
					: null,
			});

		reaction.message.channel.send({
			content: `<@${reaction.message.author.id}>:`,
			embeds: [embedEmbed],
		});
	} catch (err) {
		console.error(err);
	}
}
