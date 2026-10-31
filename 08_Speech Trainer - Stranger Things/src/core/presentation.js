// Whitelist UI data. Never spread the full story/solution into a screen model.
export function publicCase(story) {
  return {id:story.id,title:story.title,level:story.level,setting:story.setting,description:story.description,publicClues:[...story.publicClues],characters:story.characters.map(({id,name,role})=>({id,name,role,profile:story.witnessProfiles[id],greeting:story.dialogue?.witnesses?.[id]?.greeting}))};
}
