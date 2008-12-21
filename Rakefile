task :spec do
  here = File.expand_path(File.dirname(__FILE__))
  Dir.glob("#{here}/spec/models/*_spec.rb").each do |s|
    sh "ruby #{s}"
  end
end