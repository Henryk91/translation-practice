import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #121212;
    color: #e0e0e0;
    font-family: sans-serif;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;
const LevelButtons = styled.div`
  margin-bottom: 15px;
  & > * {
    margin-right: 8px;
  }
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;
const Label = styled.label`
  margin-right: 10px;
  color: #e0e0e0;
`;
const Select = styled.select`
  margin-right: 20px;
  padding: 6px;
  border: none;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
`;
const TextInput = styled.input`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  width: 300px;
  margin-right: 10px;
`;
const Button = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  &:hover { background-color: #444; }
`;
const Table = styled.table`
  width: 100%;
  max-width: 800px;
  border-collapse: collapse;
`;
const TableRow = styled.tr`
  border-bottom: 1px solid #333;
`;
const TableCell = styled.td`
  padding: 10px;
  vertical-align: top;
`;
const FeedbackSpan = styled.span<{ correct: boolean }>`
  color: ${props => (props.correct ? '#00ff00' : '#ff4444')};
  margin-right: 4px;
`;

interface FeedbackWord { word: string; correct: boolean; }
interface Row { sentence: string; userInput: string; translation: string; feedback: FeedbackWord[] | null; }

enum Level { A1 = 'a1', A2 = 'a2', B1 = 'b1', B2 = 'b2', C1 = 'c1', C2 = 'c2' }

// Placeholder sentences for each level
// Meaningful sentences for each CEFR level
const levelSentences: Record<Level, string> = {
  a1: [
    "Hello.",
    "My name is John.",
    "I live in a small town.",
    "I have a cat.",
    "This is my book.",
    "I like coffee.",
    "She is my friend.",
    "He is a teacher.",
    "This is a pen.",
    "That is a table.",
    "I am hungry.",
    "I am happy.",
    "I am tired.",
    "I go to school.",
    "I like dogs.",
    "The sky is blue.",
    "The sun is hot.",
    "It is raining.",
    "It is cold.",
    "I eat an apple.",
    "I drink water.",
    "I write a letter.",
    "I read a book.",
    "I watch TV.",
    "I play football.",
    "She reads a newspaper.",
    "He watches a movie.",
    "We walk in the park.",
    "They swim in the pool.",
    "I listen to music.",
    "I speak English.",
    "I cook dinner.",
    "I open the door.",
    "I close the window.",
    "I clean my room.",
    "I fix my bike.",
    "I buy groceries.",
    "I sell my car.",
    "I drive to work.",
    "I work from home."
  ].join(' '),
  a2: [
    "Yesterday I went to the market.",
    "I have been to Paris.",
    "I usually drink tea in the morning.",
    "She called me last night.",
    "We will travel next week.",
    "He helped me with my homework.",
    "They lived here for a year.",
    "I tried a new recipe yesterday.",
    "She studied French at university.",
    "I enjoyed the concert.",
    "He asked me a question.",
    "We booked a hotel room.",
    "They visited their parents.",
    "I waited for the bus.",
    "She cleaned the kitchen.",
    "I walked to the park.",
    "He saw a beautiful bird.",
    "We listened to the teacher.",
    "They explained the rules.",
    "I understood the problem.",
    "She forgot her keys.",
    "He remembered the address.",
    "We discussed the plan.",
    "They practiced speaking English.",
    "I planned my trip.",
    "She packed her suitcase.",
    "He fixed the broken chair.",
    "We painted the wall.",
    "They organized the event.",
    "I returned the book to the library.",
    "She borrowed some money.",
    "He washed the car.",
    "We played chess.",
    "They trained for the race.",
    "I improved my English skills.",
    "She joined a new club.",
    "He opened a new account.",
    "We started the project.",
    "They finished their homework."
  ].join(' '),
  b1: [
    "By the time I arrived, the movie had already started.",
    "If I had more time, I would learn another language.",
    "I have been working here since 2010.",
    "She was surprised by the news.",
    "We will have finished the report by tomorrow.",
    "They hadn't completed the task before the deadline.",
    "I would travel more if I had the money.",
    "She could speak three languages fluently.",
    "He must have forgotten our meeting.",
    "We might go out later if it stops raining.",
    "They should study for the exam.",
    "I used to live in Germany.",
    "She enjoys cooking international dishes.",
    "He suggested taking a short break.",
    "We discussed different solutions.",
    "They considered buying a new car.",
    "I managed to finish on time.",
    "She promised to call me back.",
    "He refused to help with the task.",
    "We agreed to meet at noon.",
    "They complained about the service.",
    "I realized my mistake too late.",
    "She avoided answering the question.",
    "He relied on his experience.",
    "We attended a conference last month.",
    "They organized a charity event.",
    "I completed the assignment quickly.",
    "She improved her presentation skills.",
    "He enhanced the security system.",
    "We navigated through the city easily.",
    "They maintained their equipment regularly.",
    "I emphasized the importance of teamwork.",
    "She confirmed the reservation.",
    "He analyzed the data carefully.",
    "We persuaded them to join the team.",
    "They graduated with honors.",
    "I volunteered at the local shelter.",
    "She facilitated the workshop.",
    "He documented the process thoroughly."
  ].join(' '),
  b2: [
    "Had I known about the meeting, I would have attended.",
    "I wish I had taken that job offer last year.",
    "By this time tomorrow, we will have completed the marathon.",
    "Despite the weather, she continued her training.",
    "I have yet to decide on my next project.",
    "He tends to overestimate his abilities.",
    "They were in the process of relocating to a new city.",
    "I am accustomed to working long hours.",
    "She finds it difficult to concentrate in noisy environments.",
    "He failed to acknowledge her contribution.",
    "We have introduced several new measures.",
    "They had scarcely arrived when it began to rain.",
    "I will never forget how supportive they were.",
    "She had no sooner sat down than the phone rang.",
    "He was reluctant to make a decision.",
    "We aim to achieve sustainable results.",
    "They committed themselves to the cause.",
    "I negotiated the contract terms successfully.",
    "She proposed a radical change to the system.",
    "He implemented an innovative solution.",
    "We conducted a thorough investigation.",
    "They evaluated the risks carefully.",
    "I derived great satisfaction from the outcome.",
    "She articulated her ideas clearly.",
    "He moderated the debate effectively.",
    "We orchestrated the entire campaign.",
    "They formulated a comprehensive strategy.",
    "I reconciled the conflicting reports.",
    "She disseminated the information widely.",
    "He consolidated all the feedback.",
    "We rectified the errors promptly.",
    "They facilitated the negotiations skillfully.",
    "I embodied the company's values.",
    "She interpreted the data accurately.",
    "He conceptualized the new design.",
    "We synthesized diverse viewpoints.",
    "They championed the environmental cause.",
    "I revitalized the old tradition.",
    "She orchestrated the reunion flawlessly."
  ].join(' '),
  c1: [
    "Not only had she mastered the subject, but she also inspired her peers.",
    "I would have preferred it if they had informed me earlier.",
    "He exhibits an exceptional ability to analyze complex problems.",
    "Despite numerous setbacks, they persevered with unwavering determination.",
    "The committee endorsed the proposal unanimously.",
    "Her eloquent speech resonated with the audience profoundly.",
    "I have seldom encountered such dedication and professionalism.",
    "He ventured into uncharted territory with remarkable courage.",
    "Their research contributes significantly to the field.",
    "I remain skeptical until I see concrete evidence.",
    "She conceded that the initial strategy required revision.",
    "He postulated a theory that challenges conventional wisdom.",
    "We synthesized the findings into a cohesive report.",
    "They orchestrated a seamless transition between phases.",
    "I facilitated the collaboration between departments.",
    "Her insights encapsulate decades of experience.",
    "He delineated the process with exceptional clarity.",
    "We mitigated the potential risks effectively.",
    "They champion the cause with unwavering resolve.",
    "I scrutinized the document for any discrepancies.",
    "She encapsulated the essence of the argument succinctly.",
    "He promulgated the new regulations without delay.",
    "We navigated the complexities with strategic acumen.",
    "They synthesized a variety of perspectives seamlessly.",
    "I galvanized the team to exceed expectations.",
    "She orchestrated the negotiations with diplomatic finesse.",
    "He conceptualizes solutions that transcend traditional boundaries.",
    "We institutionalized best practices across the organization.",
    "They perpetuate a culture of continuous improvement.",
    "I extrapolated the data to predict future trends.",
    "She articulated a vision that galvanizes stakeholders.",
    "He integrated multidisciplinary approaches innovatively.",
    "We decentralized decision-making for greater agility.",
    "They fortified the infrastructure against potential threats.",
    "I validated the hypothesis through rigorous testing.",
    "She contextualized the findings within a broader framework.",
    "He steered the project to successful completion.",
    "We pioneered a novel methodology for data analysis."
  ].join(' '),
  c2: [
    "Throughout the annals of history, few have exhibited such prodigious talent.",
    "I would have you believe that the journey itself is the greatest reward.",
    "Her unparalleled expertise transcends the ordinary bounds of the discipline.",
    "Despite the ostensibly insurmountable obstacles, they orchestrated a masterful recovery.",
    "He elucidates complex concepts with remarkable lucidity.",
    "Their endeavors have irrevocably altered the trajectory of the field.",
    "I have seldom witnessed such consummate professionalism in action.",
    "She navigates the intricacies of diplomacy with consummate skill.",
    "They championed a paradigm shift in organizational culture.",
    "He extrapolated a nuanced interpretation from the arcane data.",
    "Her discourse delves into the metaphysical implications of the theory.",
    "We instituted a holistic framework to address systemic issues.",
    "They perpetuate a lineage of excellence that defies convention.",
    "He synthesizes disparate philosophies into a coherent worldview.",
    "She promulgated an ethos of inclusivity across the enterprise.",
    "I inferred subtleties that eluded the casual observer.",
    "Their oeuvre embodies a confluence of innovation and tradition.",
    "He conceptualized an algorithm that redefines computational limits.",
    "She distilled esoteric ideas into accessible insights.",
    "We orchestrated a multifaceted strategy transcending geopolitical boundaries.",
    "They fortified the conceptual groundwork for future inquiry.",
    "I instantiated a prototype that challenged prevailing orthodoxy.",
    "Her articulations resonate with profound philosophical depth.",
    "He consolidated interdisciplinary research to groundbreaking effect.",
    "We navigated the labyrinthine regulatory landscape adeptly.",
    "They pervaded the discourse with an undercurrent of transformative vision.",
    "I extrapolated exigent imperatives from empirical observations.",
    "She perpetuated a symbiotic relationship between theory and praxis.",
    "He promulgates an integrative paradigm that subverts reductive analysis.",
    "We galvanized diasporic communities toward collective action.",
    "They institutionalized a culture of reflexive critique and adaptation.",
    "I circumscribed the parameters of the study with meticulous precision.",
    "Her discourse encapsulates the quintessence of interdisciplinary collaboration.",
    "He elucidates an ontology that transcends ontological convention.",
    "We orchestrated a syncretic framework for global sustainability.",
    "They instantiated an impermanent yet enduring coalition of innovators.",
    "I extrapolated latent potentials that had hitherto remained obfuscated."
  ].join(' ')
};

const App: React.FC = () => {
  const defaultText = levelSentences[Level.A2];
  const [text, setText] = useState<string>(defaultText);
  const [mode, setMode] = useState<'easy' | 'hard'>('easy');
  const [rows, setRows] = useState<Row[]>([]);

  const splitSentences = (input: string): string[] =>
    input.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

  const handleLevelClick = (lvl: Level) => {
    setText(levelSentences[lvl]);
    setRows([]);
  };

  const handleTextSubmit = (): void => {
    const sentences = splitSentences(text);
    setRows(sentences.map(sentence => ({ sentence, userInput: '', translation: '', feedback: null })));
  };

  const translateSentence = async (sentence: string): Promise<string> => {
    const res = await fetch('http://localhost:5001/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sentence }) });
    const json = await res.json();
    return json.translated;
  };

  const handleTranslate = async (index: number): Promise<void> => {
    const row = rows[index]; if (!row.userInput) return;
    const translated = await translateSentence(row.sentence);
    const germanWords = translated.split(' ');
    const userWords = row.userInput.split(' ');
    const feedback = germanWords.map((gw, i) => {
      const uw = userWords[i] || '';
      const normalize = (s: string) => s.replace(/[.,!?:;"-]/g, '').toLowerCase();
      const correct = mode === 'hard' ? uw === gw : normalize(uw) === normalize(gw);
      return { word: gw, correct };
    });
    setRows(r => r.map((r, i) => i === index ? { ...r, translation: translated, feedback } : r));
  };

  const handleKeyPress = (e: any, idx: number): void => { if (e.key === 'Enter') { e.preventDefault(); handleTranslate(idx); } };
  const handleInputChange = (e: any, idx: number): void => { const v = e.target.value; setRows(r => r.map((r, i) => i === idx ? { ...r, userInput: v } : r)); };

  return (
    <>
      <GlobalStyle />
      <Container>
        <LevelButtons>
          {[Level.A1, Level.A2, Level.B1, Level.B2, Level.C1, Level.C2].map(lvl => (
            <Button key={lvl} onClick={() => handleLevelClick(lvl)}>
              {lvl.toUpperCase()}
            </Button>
          ))}
        </LevelButtons>
        <Header>
          <Label>Mode:</Label>
          <Select value={mode} onChange={(e: any) => setMode(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="hard">Hard</option>
          </Select>
          <TextInput placeholder="Enter English text..." value={text} onChange={(e: any) => setText(e.target.value)} />
          <Button onClick={handleTextSubmit}><FontAwesomeIcon icon={faPaperPlane} /></Button>
        </Header>
        {rows.length > 0 && (
          <Table>
            <tbody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.sentence}</TableCell>
                  <TableCell>
                    <TextInput value={row.userInput} onChange={(e: any) => handleInputChange(e, idx)} onKeyPress={(e: any) => handleKeyPress(e, idx)} />
                    <Button onClick={() => handleTranslate(idx)}><FontAwesomeIcon icon={faPaperPlane} /></Button>
                  </TableCell>
                  <TableCell>
                    {row.feedback ? row.feedback.map((fb, i) => (<FeedbackSpan key={i} correct={fb.correct}>{fb.word}</FeedbackSpan>)) : null}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
};

export default App;
