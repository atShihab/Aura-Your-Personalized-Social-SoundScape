import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Headphones, Clock, Music, User, Play, Calendar } from 'lucide-react';

interface ListeningHistorySectionProps {
	userId: string;
}

const ListeningHistorySection = ({ userId }: ListeningHistorySectionProps) => {
	const [activeTab, setActiveTab] = useState<'recent' | 'history' | 'stats'>('recent');
	const [period, setPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');

	return (
		<Card className="bg-zinc-900/50 border-zinc-800">
			<CardHeader>
				<CardTitle className="text-white flex items-center gap-2">
					<Headphones className="w-5 h-5 text-emerald-500" />
					Listening History
				</CardTitle>
				<CardDescription className="text-zinc-400">
					Your music listening activity and statistics
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
					<TabsList className="grid w-full grid-cols-3 bg-zinc-800">
						<TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
						<TabsTrigger value="history" className="text-xs">History</TabsTrigger>
						<TabsTrigger value="stats" className="text-xs">Statistics</TabsTrigger>
					</TabsList>
					
					<TabsContent value="recent" className="mt-4">
						<ScrollArea className="h-64">
							<div className="space-y-2">
								<div className="text-center py-8 text-zinc-400">
									<Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p>No recent activity</p>
									<p className="text-sm">Start listening to music to see your activity!</p>
								</div>
							</div>
						</ScrollArea>
					</TabsContent>
					
					<TabsContent value="history" className="mt-4">
						<ScrollArea className="h-64">
							<div className="space-y-2">
								<div className="text-center py-8 text-zinc-400">
									<Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<p>No listening history</p>
									<p className="text-sm">Your listening history will appear here</p>
								</div>
							</div>
						</ScrollArea>
					</TabsContent>
					
					<TabsContent value="stats" className="mt-4 space-y-4">
						<div className="flex items-center gap-2 mb-4">
							<Select value={period} onValueChange={(value) => setPeriod(value as any)}>
								<SelectTrigger className="w-32 bg-zinc-800 border-zinc-700">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Time</SelectItem>
									<SelectItem value="week">This Week</SelectItem>
									<SelectItem value="month">This Month</SelectItem>
									<SelectItem value="year">This Year</SelectItem>
								</SelectContent>
							</Select>
						</div>
						
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<Card className="bg-zinc-800/50 border-zinc-700">
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<Clock className="w-5 h-5 text-emerald-500" />
										<div>
											<p className="text-zinc-400 text-sm">Total Time</p>
											<p className="text-white font-bold">0h 0m</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-zinc-800/50 border-zinc-700">
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<Headphones className="w-5 h-5 text-blue-500" />
										<div>
											<p className="text-zinc-400 text-sm">Sessions</p>
											<p className="text-white font-bold">0</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-zinc-800/50 border-zinc-700">
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<Music className="w-5 h-5 text-purple-500" />
										<div>
											<p className="text-zinc-400 text-sm">Songs</p>
											<p className="text-white font-bold">0</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-zinc-800/50 border-zinc-700">
								<CardContent className="p-4">
									<div className="flex items-center gap-2">
										<User className="w-5 h-5 text-orange-500" />
										<div>
											<p className="text-zinc-400 text-sm">Artists</p>
											<p className="text-white font-bold">0</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default ListeningHistorySection;
