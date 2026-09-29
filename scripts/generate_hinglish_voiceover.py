import asyncio
import os
import subprocess
import edge_tts

VOICE = "hi-IN-MadhurNeural" # Ultra-realistic Indian Male Neural Voice
RATE = "+0%"
VOLUME = "+0%"

SCENES = [
    {
        "id": "scene_1",
        "title": "Core Governance Challenge",
        "text": "Har saal, MPLADS scheme ke through poore desh ke 543 parliamentary constituencies mein hazaaron project recommendations, sanction approvals aur financial disbursements generate hote hain. MoSPI aur District Authorities ke liye sabse bada challenge sirf is data ko store karna nahi hai, balki real issue yeh identify karna hai ki hazaaron works mein se kin projects par immediate administrative dhyan dene ki zaroorat hai. Manual auditing ke through payment aur physical progress ke mismatches, material price escalation, ya artificial project splitting ko continuously track karna practically impossible ho jata hai. Isi critical challenge ko solve karne ke liye humne build kiya hai MPLADS-AI, ek explainable AI intelligence layer jo raw government data ko prioritized, evidence-backed actionable insights mein convert karta hai."
    },
    {
        "id": "scene_2",
        "title": "Data Trust & Pipeline",
        "text": "Sabhi projects ko ek jaisa treat karne ke bajaye, MPLADS-AI har project ko uske recommendation se lekar final asset handover tak continuously monitor karta hai. Platform ke top par hamara Data Trust framework complete data provenance ensure karta hai. Har ek single record directly official e-Sakshi data structure aur public expenditure registries se securely ingest hota hai. Hum koi bhi fabricated numbers ya assumptions use nahi karte, AI ka har ek analytical finding directly ek verifiable source record se linked rehta hai."
    },
    {
        "id": "scene_3",
        "title": "National Executive Dashboard",
        "text": "Main Executive Command Dashboard par senior authorities ko poora macroeconomic overview ek nazar mein milta hai. System mein monitored 38,000 se zyada works mein se, hamara AI engine automatically un 327 cases ko highlight karta hai jismein anomalies ya verification ki zaroorat hai. Geospatial map district-level execution density dikhata hai, aur Fund Utilization widget parliamentary sanctions ke against expenditure velocity ko track karta hai. Lekin hamara platform sirf high-level charts tak seemit nahi hai, chaliye dekhte hain AI anomalies ko kaise detect karta hai."
    },
    {
        "id": "scene_4",
        "title": "AI Insights & Anomaly Engine",
        "text": "Yeh hai hamara AI Insights aur Forensic Command Centre. Yahan multi-layered detection engine chaar core vectors par projects ko analyze karta hai: payment aur progress ka mismatch, CPWD Schedule of Rates ke comparison mein material price escalation, duplicate proposals, aur contractor workload saturation. Active alerts ke neeche hamara interactive Procurement Network Graph multi-project connections ko expose karta hai, elected MPs, executing agencies, payment accounts, aur verified vendors ke beech ke hidden links ko clearly trace karta hai. Sabse important baat, system koi black-box assumption nahi banata, balki confidence-weighted risk score ke saath exact primary evidence display karta hai. Chaliye Araria, Bihar ke is flagged project par Investigate Case click karke dekhte hain."
    },
    {
        "id": "scene_5",
        "title": "Investigation & What-If Simulator",
        "text": "Jab ek investigating officer case ko open karta hai, toh platform complete explainability provide karta hai. Overall 78.5 ka risk score paanch additive components mein breakdown hota hai: budget variance, peer cohort delay, fiscal rush payment pattern, spatial risk density, aur missing milestone proofs. Iske baad, What-If Simulation tab ke through officer counterfactual analysis run kar sakta hai. Jaise hi executing agency verified geo-tagged photograph aur invoice reconcile karti hai, risk indicator automatically high se low drop ho jata hai. Officer Action section ke andar, authority inspection log kar sakti hai, internal notes add kar sakti hai, aur directly system se official Vigilance Inquiry Notice generate kar sakti hai."
    },
    {
        "id": "scene_6",
        "title": "Statutory Decision Support",
        "text": "Revised MPLADS 2023 Guidelines ke according statutory compliance mandatory hai. Hamara Decision Support portal har administrative tier ke liye tailored intelligence deta hai. District Collector view mein, 75-Day Sanction Overdue Tracker automatically un works ko flag karta hai jahan MP recommendation ke baad administrative approval statutory 75 days ki deadline cross kar chuka hai. Isi tarah, SC/ST Quota Tracker statutory mandate ko monitor karta hai, jismein kam se kam 15% expenditure Scheduled Caste areas aur 7.5% Scheduled Tribe areas mein hona anivarya hai, aur kisi bhi allocation deficit par instant alert generate karta hai."
    },
    {
        "id": "scene_7",
        "title": "Ask MPLAD Conversational AI",
        "text": "Monitoring ko bina kisi complex database queries ke har officer ke liye accessible banane ke liye, humne integrate kiya hai Ask MPLAD, hamara natural language conversational assistant. Chaliye poochte hain: Show delayed projects in Maharashtra. Simple keyword search ke bajaye, Ask MPLAD statutory context ko interpret karta hai, state aur progress stages ke basis par records filter karta hai, delay metrics calculate karta hai, aur structured KPIs ke saath complete project list return karta hai. Har response ke saath official data provenance verifiable rehti hai, aur officer single click mein poora verified dataset CSV format mein export kar sakta hai."
    },
    {
        "id": "scene_8",
        "title": "Impact & Conclusion",
        "text": "MPLADS-AI human officers ko replace nahi karta, balki unhe empower karta hai taaki unhe pehle se pata ho ki sabse pehle kahan check karna hai. Automated anomaly detection se lekar multi-factor explainability, geo-tagged verification, aur natural language analytics tak, hum MoSPI ke vision ke liye ek complete, robust, aur transparent governance platform deliver karte hain. Yeh hai MPLADS-AI: Delivering transparency, accountability, aur speed to India's public infrastructure. Thank you!"
    }
]

async def generate_scene_audio(scene, output_path):
    print(f"Generating audio for {scene['id']} ({scene['title']})...")
    communicate = edge_tts.Communicate(scene["text"], VOICE, rate=RATE, volume=VOLUME)
    await communicate.save(output_path)
    print(f"Saved: {output_path}")

async def main():
    os.makedirs("artifacts_media/hinglish_audio", exist_ok=True)
    audio_files = []
    
    for scene in SCENES:
        out_file = f"artifacts_media/hinglish_audio/{scene['id']}.mp3"
        await generate_scene_audio(scene, out_file)
        audio_files.append(out_file)
        
    # Create FFmpeg concat list with natural pause between scenes
    list_path = "artifacts_media/hinglish_audio/concat_list.txt"
    with open(list_path, "w") as f:
        for audio in audio_files:
            abs_path = os.path.abspath(audio)
            f.write(f"file '{abs_path}'\n")
            
    master_audio = "artifacts_media/MPLADS_AI_SIH2026_HINGLISH_VOICEOVER.mp3"
    print(f"Concatenating into master audio {master_audio}...")
    subprocess.run([
        "./node_modules/ffmpeg-static/ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", list_path,
        "-c:a", "libmp3lame", "-b:a", "192k",
        master_audio
    ], check=True)
    
    # Merge audio with the 1080p silent video to create final Hinglish MP4
    final_video = "artifacts_media/MPLADS_AI_SIH2026_HINGLISH_FINAL_DEMO.mp4"
    print(f"Rendering final Hinglish video {final_video}...")
    subprocess.run([
        "./node_modules/ffmpeg-static/ffmpeg", "-y",
        "-i", "artifacts_media/MPLADS_AI_SIH2026_SILENT_DEMO.mp4",
        "-i", master_audio,
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        final_video
    ], check=True)
    
    print("SUCCESS! Generated:", final_video)

if __name__ == "__main__":
    asyncio.run(main())
