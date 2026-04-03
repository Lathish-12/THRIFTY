import java.util.*;

public class SmartHabitTracker {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        String[] habits = new String[5];
        int[] status = new int[5];
        int completed = 0;

        System.out.println("SMART HABIT TRACKER WITH AI SUGGESTIONS");

        for(int i = 0; i < habits.length; i++) {
            System.out.print("Enter Habit " + (i+1) + ": ");
            habits[i] = sc.nextLine();

            System.out.print("Did you complete it today? (1=Yes, 0=No): ");
            status[i] = sc.nextInt();
            sc.nextLine();

            if(status[i] == 1) {
                completed++;
            }
        }

        System.out.println("\nHabit Summary:");
        for(int i = 0; i < habits.length; i++) {
            System.out.println(habits[i] + " : " + (status[i]==1 ? "Completed" : "Not Completed"));
        }

        System.out.println("\nAI Suggestion:");

        if(completed == 5) {
            System.out.println("Excellent! Keep maintaining your habits.");
        }
        else if(completed >= 3) {
            System.out.println("Good progress! Try to improve consistency.");
        }
        else {
            System.out.println("You need improvement. Start with small daily goals.");
        }

        System.out.println("Completed Habits: " + completed + "/5");

        sc.close();
    }
}