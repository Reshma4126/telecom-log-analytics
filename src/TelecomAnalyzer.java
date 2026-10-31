
import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class TelecomAnalyzer {

    public static class TelecomMapper
            extends Mapper<LongWritable, Text, Text, Text> {

        private final Text regionKey = new Text();
        private final Text callData = new Text();

        @Override
        public void map(LongWritable key, Text value, Context context)
                throws IOException, InterruptedException {

            String line = value.toString().trim();

            // Skip CSV header and empty lines
            if (line.isEmpty() || line.startsWith("call_id")) {
                return;
            }

            String[] fields = line.split(",");

            if (fields.length != 5) {
                return;
            }

            String callerRegion = fields[1].trim();
            String duration = fields[3].trim();
            String status = fields[4].trim();

            regionKey.set(callerRegion);
            callData.set("1," +
                    (status.equalsIgnoreCase("SUCCESS") ? "1" : "0") + "," +
                    (status.equalsIgnoreCase("FAILED") ? "1" : "0") + "," +
                    duration);

            context.write(regionKey, callData);
        }
    }

    public static class TelecomReducer
            extends Reducer<Text, Text, Text, Text> {

        @Override
        public void reduce(Text key, Iterable<Text> values, Context context)
                throws IOException, InterruptedException {

            int totalCalls = 0;
            int successfulCalls = 0;
            int failedCalls = 0;
            long totalDuration = 0;

            for (Text value : values) {
                String[] data = value.toString().split(",");

                totalCalls += Integer.parseInt(data[0]);
                successfulCalls += Integer.parseInt(data[1]);
                failedCalls += Integer.parseInt(data[2]);
                totalDuration += Long.parseLong(data[3]);
            }

            String result = totalCalls + "\t" +
                    successfulCalls + "\t" +
                    failedCalls + "\t" +
                    totalDuration;

            context.write(key, new Text(result));
        }
    }

    public static void main(String[] args) throws Exception {

        if (args.length != 2) {
            System.err.println(
                "Usage: TelecomAnalyzer <input-path> <output-path>");
            System.exit(2);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Telecom Network Log Analysis");

        job.setJarByClass(TelecomAnalyzer.class);
        job.setMapperClass(TelecomMapper.class);
        job.setReducerClass(TelecomReducer.class);

        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(Text.class);

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
