"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { saveTrialData } from "@/lib/firebase";
import { MonitorPlay } from "lucide-react";

type Trial = {
  participant_id: string;
  timestamp: string;
  trial_number: number;
  reaction_time_ms: number;
  stimulus_interval_s: number;
  premature_click: boolean;
};

type GameState = "instructions" | "waiting" | "stimulus" | "too_early" | "results";

const TOTAL_TRIALS = 30;

const InstructionsScreen = ({ onStartTest }: { onStartTest: (participantId: string) => void }) => {
  const [participantId, setParticipantId] = React.useState("");
  
  return (
    <Card className="w-full max-w-2xl animate-in fade-in duration-500 border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <MonitorPlay className="h-12 w-12 text-primary" />
          <div>
            <CardTitle className="font-headline text-4xl text-primary-foreground">ReactiFast</CardTitle>
            <CardDescription className="font-headline text-muted-foreground">
              Welcome to the Reaction Time Test.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-headline text-lg mb-2">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Keep your eyes on the screen at all times.</li>
            <li>Only click when the screen changes from black to white.</li>
            <li>Do not try to predict the change — wait for it.</li>
            <li>Respond as quickly as possible after the change.</li>
            <li>The test includes {TOTAL_TRIALS} attempts.</li>
          </ol>
        </div>
        <div className="space-y-2">
          <Label htmlFor="participant-id" className="font-headline">Enter Your Name or ID</Label>
          <Input
            id="participant-id"
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
            placeholder="e.g., subject_01"
            className="bg-secondary border-primary/30"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          onClick={() => onStartTest(participantId)}
          disabled={!participantId.trim()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline"
        >
          Start Test
        </Button>
      </CardFooter>
    </Card>
  );
};


const ResultsScreen = ({
  trials,
  onTryAgain,
  participantId,
}: {
  trials: Trial[];
  onTryAgain: () => void;
  participantId: string;
}) => {
  const validTrials = trials.filter((t) => !t.premature_click && t.reaction_time_ms > 0);
  const reactionTimes = validTrials.map((t) => t.reaction_time_ms);
  const totalErrors = trials.length - validTrials.length;

  const average =
    reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

  const stdDev =
    reactionTimes.length > 1
      ? Math.sqrt(
          reactionTimes
            .map((x) => Math.pow(x - average, 2))
            .reduce((a, b) => a + b, 0) /
            (reactionTimes.length - 1)
        )
      : 0;
  
  const handleExport = () => {
    const dataForExport = trials.map((trial) => ({
      "Trial Number": trial.trial_number,
      "Reaction Time (ms)": trial.premature_click ? "-" : trial.reaction_time_ms,
      "Stimulus Interval (s)": trial.stimulus_interval_s.toFixed(2),
      "Was Error": trial.premature_click ? "Yes" : "No",
      Timestamp: trial.timestamp,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, `${participantId || "results"}.xlsx`);
  };

  return (
    <Card className="w-full max-w-4xl animate-in fade-in duration-700">
      <CardHeader>
        <CardTitle className="font-headline text-4xl">Test Complete</CardTitle>
        <CardDescription>Results for: <span className="font-bold text-primary">{participantId}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div className="rounded-lg border bg-card text-card-foreground p-4">
            <p className="text-sm text-muted-foreground font-headline">Average Reaction</p>
            <p className="text-3xl font-bold text-primary">
              {average.toFixed(0)} ms
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground p-4">
            <p className="text-sm text-muted-foreground font-headline">Std. Deviation</p>
            <p className="text-3xl font-bold">{stdDev.toFixed(0)} ms</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground p-4">
            <p className="text-sm text-muted-foreground font-headline">Premature Clicks</p>
            <p className="text-3xl font-bold text-destructive">{totalErrors}</p>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Trial</TableHead>
                <TableHead>Reaction (ms)</TableHead>
                <TableHead>Interval (s)</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trials.map((trial) => (
                <TableRow key={trial.trial_number}>
                  <TableCell>{trial.trial_number}</TableCell>
                  <TableCell>
                    {trial.premature_click ? "-" : trial.reaction_time_ms}
                  </TableCell>
                  <TableCell>{trial.stimulus_interval_s.toFixed(2)}</TableCell>
                  <TableCell className={cn(trial.premature_click && "text-destructive")}>
                    {trial.premature_click ? "Premature Click" : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
        <Button onClick={onTryAgain} className="w-full sm:w-auto font-headline" size="lg">
          Try Again
        </Button>
        <Button onClick={handleExport} className="w-full sm:w-auto font-headline" variant="outline">
          Export to Excel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Home() {
  const [gameState, setGameState] = React.useState<GameState>("instructions");
  const [trials, setTrials] = React.useState<Trial[]>([]);
  const [startTime, setStartTime] = React.useState<number>(0);
  const [participantId, setParticipantId] = React.useState<string>("");
  const [currentTimeout, setCurrentTimeout] =
    React.useState<NodeJS.Timeout | null>(null);
  const [tooEarlyTimeout, setTooEarlyTimeout] =
    React.useState<NodeJS.Timeout | null>(null);
  const [stimulusInterval, setStimulusInterval] = React.useState(0);

  const resetTest = () => {
    if (currentTimeout) clearTimeout(currentTimeout);
    if (tooEarlyTimeout) clearTimeout(tooEarlyTimeout);
    setTrials([]);
    setParticipantId("");
    setGameState("instructions");
  };

  const startTest = (id: string) => {
    setParticipantId(id);
    setGameState("waiting");
  };

  const startNextTrial = () => {
    if (trials.length >= TOTAL_TRIALS) {
      setGameState("results");
    } else {
      setGameState("waiting");
    }
  };

  const handlePrematureClick = () => {
    if (currentTimeout) clearTimeout(currentTimeout);
    
    const newTrial: Trial = {
      participant_id: participantId,
      timestamp: new Date().toISOString(),
      trial_number: trials.length + 1,
      reaction_time_ms: 0,
      stimulus_interval_s: stimulusInterval,
      premature_click: true,
    };
    saveTrialData(newTrial);
    setTrials((prev) => [...prev, newTrial]);
    setGameState("too_early");

    const timeoutId = setTimeout(() => {
       startNextTrial();
    }, 2000);
    setTooEarlyTimeout(timeoutId);
  };

  const handleReaction = () => {
    const reactionTime = Date.now() - startTime;
    const newTrial: Trial = {
      participant_id: participantId,
      timestamp: new Date().toISOString(),
      trial_number: trials.length + 1,
      reaction_time_ms: reactionTime,
      stimulus_interval_s: stimulusInterval,
      premature_click: false,
    };
    saveTrialData(newTrial);
    setTrials((prev) => [...prev, newTrial]);
    startNextTrial();
  };

  React.useEffect(() => {
    if (gameState === "waiting") {
      const randomDelay = Math.random() * 9000 + 1000; // 1-10 seconds
      setStimulusInterval(Number((randomDelay / 1000).toFixed(2)));

      const timeoutId = setTimeout(() => {
        setStartTime(Date.now());
        setGameState("stimulus");
      }, randomDelay);

      setCurrentTimeout(timeoutId);

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [gameState, trials.length]);

  const renderContent = () => {
    switch (gameState) {
      case "instructions":
        return <InstructionsScreen onStartTest={startTest} />;
      case "results":
        return <ResultsScreen trials={trials} onTryAgain={resetTest} participantId={participantId} />;
      case "waiting":
      case "stimulus":
      case "too_early":
        return (
          <div
            className={cn(
              "fixed inset-0 cursor-pointer",
              (gameState === "waiting" || gameState === "too_early") && "bg-black",
              gameState === "stimulus" && "bg-white"
            )}
            onClick={
              gameState === "waiting"
                ? handlePrematureClick
                : gameState === "stimulus"
                ? handleReaction
                : undefined
            }
          >
            {gameState === "too_early" && (
              <div className="flex h-full w-full items-center justify-center animate-in fade-in">
                <p className="text-white text-3xl md:text-5xl font-headline text-center p-4">
                  Too early. Wait for the change.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      {renderContent()}
    </main>
  );
}
