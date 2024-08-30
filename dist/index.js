"use strict";var j=Object.create;var v=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var z=Object.getOwnPropertyNames;var W=Object.getPrototypeOf,X=Object.prototype.hasOwnProperty;var Y=(e,t)=>{for(var o in t)v(e,o,{get:t[o],enumerable:!0})},Z=(e,t,o,p)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of z(t))!X.call(e,s)&&s!==o&&v(e,s,{get:()=>t[s],enumerable:!(p=F(t,s))||p.enumerable});return e};var B=(e,t,o)=>(o=e!=null?j(W(e)):{},Z(t||!e||!e.__esModule?v(o,"default",{value:e,enumerable:!0}):o,e));var d=require("discord.js");var M=B(require("dotenv"));M.default.config();var{DISCORD_TOKEN:R,DISCORD_CLIENT_ID:G,GUILD_ID:ee,ANNOUNCEMENT_CHANNEL_ID:$}=process.env;if(!R||!G||!$)throw new Error("Missing environment variables");var n={DISCORD_TOKEN:R,DISCORD_CLIENT_ID:G,GUILD_ID:ee,ANNOUNCEMENT_CHANNEL_ID:$};var D={};Y(D,{data:()=>te,execute:()=>oe});var H=require("discord.js"),te=new H.SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!");async function oe(e){return e.reply("Pong with proposal")}var l={ping:D};var f=require("discord.js");var re=Object.values(l).map(e=>e.data),ae=new f.REST({version:"10"}).setToken(n.DISCORD_TOKEN);async function U({guildId:e}){try{console.log("Started refreshing application (/) commands."),await ae.put(f.Routes.applicationGuildCommands(n.DISCORD_CLIENT_ID,e),{body:re}),console.log("Successfully reloaded application (/) commands.")}catch(t){console.error(t)}}var _=B(require("axios"));var S="https://api.studio.thegraph.com/query/73494/daohaus-v3-gnosis/version/latest";var L=require("discord.js");var V=async()=>{try{let t=await _.default.post(S,{query:`
    query ProposalQuery {
      dao(id: "0xf02fd4286917270cb94fbc13a0f4e1ed76f7e986") {
        createdAt
        createdBy
        txHash
        proposals(first: 1) {
          id 
          createdAt 
          createdBy 
          proposedBy 
          proposerMembership 
          dao 
          proposalId 
          proposalData 
          votingStarts 
          votingEnds 
          expiration 
          actionGasEstimate 
          details 
          sponsor
          sponsorMembership 
          proposalOffering 
          tributeOffered
          proposalType 
          title
          
        }
      }
    }
  `});if(t.data.errors)throw new Error(t.data.errors[0].message);return console.log("100%",t.data.data.dao.proposals),t.data.data.dao.proposals}catch(e){return JSON.stringify(e)}},q=async()=>{try{let e=`
    query ProposalQuery {
      dao(id: "0xf02fd4286917270cb94fbc13a0f4e1ed76f7e986") {
        createdAt
        createdBy
        txHash
        proposals(where: { votingStarts_gt: ${Date.now()-6e5}, createdAt_lte: ${Date.now()-6e5} }
            orderBy: votingStarts
            orderDirection: desc
          ) {
          id 
          createdAt 
          createdBy 
          proposedBy 
          proposerMembership 
          dao 
          proposalId 
          proposalData 
          votingStarts 
          votingEnds 
          expiration 
          actionGasEstimate 
          details 
          sponsor
          sponsorMembership 
          proposalOffering 
          tributeOffered
          proposalType 
          title
        }
      }
    }
  `,t=await _.default.post(S,{query:e});if(t.data.errors)throw new Error(t.data.errors[0].message);return console.log("100%",t.data.data.dao.proposals),t.data.data.dao.proposals}catch(e){return JSON.stringify(e)}};function b(e,t,o){let p=e.channels.cache.get(n.ANNOUNCEMENT_CHANNEL_ID),s,E,u;for(let r=0;r<o.length;r++){let a=[],k=o[r].details;u=JSON.parse(k),s=u.title,E=u.description;let se=new Date(o[r].createdAt),C=o[r].createdBy;C!=""&&a.push({name:"Created by:",value:C,inline:!0});let N=o[r].proposedBy,J=o[r].proposerMembership;N!=""&&a.push({name:"Proposed by:",value:`${N}, (${J})`,inline:!0});let w=o[r].txHash;w!=""&&a.push({name:"Transaction Hash:",value:w,inline:!1});let O=o[r].proposalType;O!=""&&a.push({name:"Type:",value:O,inline:!0});let x=o[r].actionGasEstimate;x!=0&&a.push({name:"Estimated gas necessary:",value:x.toString(),inline:!0});let I=o[r].proposalOffering;I!=0&&a.push({name:"Tribute amount at submission:",value:I.toString(),inline:!0});let T=o[r].tributeOffered;T&&a.push({name:"Tribute amount offered:",value:T.toString(),inline:!0});let g=new Date,A=o[r].votingStarts;if(A<g){let c=o[r].votingEnds-g.getTime(),m=Math.floor(c/1e3),h=Math.floor(m/3600),Q=m%3600;a.push({name:"Voting time left:",value:`${h}h ${Q}s`,inline:!0})}else{let P=A-g.getTime(),c=Math.floor(P/1e3),m=Math.floor(c/3600),h=c%3600;a.push({name:"Voting starts in:",value:`${m}h ${h}s`,inline:!0})}let y="Proposal";t?y=`New proposal: "${s}" `:y=`Proposal "${s}" has entered voting period`;let K=new L.EmbedBuilder().setColor(16726116).setTitle(y).setDescription(E).addFields(a).setThumbnail("https://avatars.githubusercontent.com/u/59065542?s=200&v=4").setTimestamp(),ne=setInterval(function(){p&&p.send({embeds:[K]})},10*1e3)}}var i=new d.Client({intents:["Guilds","GuildMessages","DirectMessages"]});i.once(d.Events.ClientReady,async e=>{console.log(`Ready! Logged in as ${e.user.tag}`);let t=await V();console.log(`proposals_new ${t}`),b(i,!0,t);let o=await q();console.log(`proposals_voting ${o}`),b(i,!1,o)});i.on("guildCreate",async e=>{await U({guildId:e.id})});i.on(d.Events.InteractionCreate,e=>{if(console.log(`interactionCreate ${e}`),!e.isCommand())return;let{commandName:t}=e;l[t]&&l[t].execute(e)});i.login(n.DISCORD_TOKEN);
